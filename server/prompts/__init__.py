from .cn.question_generate import get_question_generate_cn
from .en.question_generate import get_question_generate_en

from .cn.answer_exmine import get_exmine_prompt_cn
from .en.answer_exmine import get_exmine_prompt_en


def choose_prompt(
    role: str,
    question_type: str,
    prompt_language: str,
    prompt_type: str,
):
    prompt = None

    if (prompt_language == "en"):
        if (prompt_type == "question_generate"):
            prompt = get_question_generate_en(question_type)
        if (prompt_type == "answer_examine"):
            prompt = get_exmine_prompt_en(role)

    if (prompt_language == "zh-CN"):
        if (prompt_type == "question_generate"):
            prompt = get_question_generate_cn(question_type)
        if (prompt_type == "answer_examine"):
            prompt = get_exmine_prompt_cn(role)

    return prompt


__all__ = [
    "choose_prompt",
]
