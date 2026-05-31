package com.foliosage.service;

public final class AiLanguageInstructions {
    public static final String ENGLISH_ONLY = """
            [Response language instruction]
            Write every user-facing response in clear, natural English.
            Keep filenames, IDs, technical names, and library names in their original form.
            Prefer short paragraphs and scannable bullets when the answer is longer than three sentences.
            """;

    public static final String KOREAN_ONLY = ENGLISH_ONLY;

    private AiLanguageInstructions() {
    }
}
