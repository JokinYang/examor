import { Semaphore } from 'async-mutex'
import { Document } from 'langchain/document'
import { StringOutputParser } from '@langchain/core/output_parsers'
import { RunnableSequence } from '@langchain/core/runnables'
import { IntergrationLlm } from '../llm'
import { choicePrompt } from '../prompt'
import {
  adjustConcurrencyByPaymentStatus,
  adjustRetriesByPaymentStatus,
  removePrefixNumbers,
  isLegalQuestionStructure,
  splitQuestions,
} from './util'
import { documentHandler, fileHandler, noteHandler } from '@/lib/db-handler'
import { questionHandler } from '@/lib/db-handler/question'
import type { TProfile } from '@prisma/client'
import type { PromptType, QuestionType, RoleType } from '@/types/global'

export class Chain {
  profile: TProfile
  semaphore: Semaphore
  noteId: string
  fileId: string
  filename: string
  questionType: QuestionType
  promptType: PromptType
  temperature: number
  streaming: boolean
  questionCount: number
  chain: RunnableSequence<any, string>
  fileAmount: number
  handledFileAmount: number

  constructor(
    profile: TProfile,
    fileAmount: number,
    noteId: string,
    fileId: string,
    filename: string,
    questionType: QuestionType,
    promptType: PromptType,
    temperature: number = 0,
    streaming: boolean = false
  ) {
    this.profile = profile
    this.semaphore = new Semaphore(adjustConcurrencyByPaymentStatus())
    this.noteId = noteId
    this.fileId = fileId
    this.filename = filename
    this.promptType = promptType
    this.temperature = temperature
    this.streaming = streaming
    this.questionCount = 0
    this.questionType = questionType
    this.chain = this.initChain(questionType)
    this.fileAmount = fileAmount
    this.handledFileAmount = 0
  }

  private initChain(questionType: QuestionType) {
    const { currentRole } = this.profile
    const llmInstance = new IntergrationLlm(this.profile, {
      temperature: this.temperature,
      streaming: this.streaming,
      maxRetries: adjustRetriesByPaymentStatus(),
      verbose: false,
    })
    const prompt = choicePrompt(
      this.promptType,
      currentRole as RoleType,
      questionType
    )

    const outputParser = new StringOutputParser()

    const chain = RunnableSequence.from([
      prompt,
      llmInstance.llm!,
      outputParser,
    ])

    return chain
  }

  public async generateQuestions(docs: Document[]): Promise<void> {
    try {
      for (const doc of docs) {
        const { id: documentId } = await documentHandler.create(
          this.noteId,
          this.fileId,
          this.filename,
          doc.pageContent
        )

        await this._generateQuestions(doc, documentId)
      }
    } catch (e) {
      throw e
    } finally {
      fileHandler.update(this.fileId, {
        isUploading: '0',
        questionCount: this.questionCount,
      })

      this.handledFileAmount += 1

      if (this.handledFileAmount === this.fileAmount) {
        await noteHandler.update(this.noteId, { isUploading: '0' })
        this.handledFileAmount = 0
      }
    }
  }

  private async _generateQuestions(doc: Document, docId: string) {
    try {
      const res = await this.chain.invoke({
        title: this.filename,
        context: doc.pageContent,
      })

      for (const question of splitQuestions(res, this.questionType)) {
        console.log(question)
        if (!isLegalQuestionStructure(question, this.questionType)) continue
        const { currentRole } = this.profile
        await questionHandler.create(
          this.noteId,
          this.fileId,
          docId,
          this.questionType,
          removePrefixNumbers(question),
          currentRole
        )

        this.questionCount += 1
      }
    } catch (e) {
      console.error('_generateQuestions error', e)
    }
  }
}
