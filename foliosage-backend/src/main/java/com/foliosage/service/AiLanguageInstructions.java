package com.foliosage.service;

public final class AiLanguageInstructions {
    public static final String KOREAN_ONLY = """
            [응답 언어 지시]
            사용자에게 보이는 모든 응답은 반드시 자연스러운 한국어로만 작성하세요.
            영어로 번역하거나 영어 문장으로 답하지 마세요.
            파일명, 고유 ID, 기술명, 라이브러리명은 원문을 유지해도 됩니다.
            """;

    private AiLanguageInstructions() {
    }
}
