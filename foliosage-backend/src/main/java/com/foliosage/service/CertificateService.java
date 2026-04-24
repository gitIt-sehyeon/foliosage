package com.foliosage.service;

import com.foliosage.entity.PortfolioFile;
import com.foliosage.repository.CertificateRepository;
import com.foliosage.repository.PortfolioFileRepository;
import com.foliosage.repository.PortfolioRepository;
import lombok.RequiredArgsConstructor;
import org.apache.pdfbox.pdmodel.*;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.apache.pdfbox.pdmodel.graphics.color.PDColor;
import org.apache.pdfbox.pdmodel.graphics.color.PDDeviceRGB;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.io.ByteArrayOutputStream;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

@Service @RequiredArgsConstructor
public class CertificateService {

    private final CertificateRepository certificateRepository;
    private final PortfolioFileRepository fileRepository;
    private final PortfolioRepository portfolioRepository;

    public byte[] generateForFile(String userEmail, UUID portfolioId, UUID fileId) throws Exception {
        PortfolioFile file = fileRepository.findById(fileId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "File not found"));
        if (!file.getPortfolio().getId().equals(portfolioId))
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        if (!file.getPortfolio().getUser().getEmail().equals(userEmail))
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");

        LocalDateTime certifiedAt = file.getCertifiedAt() != null
                ? file.getCertifiedAt().withOffsetSameInstant(ZoneOffset.UTC).toLocalDateTime()
                : LocalDateTime.now(ZoneOffset.UTC);

        return buildPdf(
                file.getName(),
                file.getFileHash(),
                file.getVaultsageFileId(),
                certifiedAt,
                file.getPortfolio().getUser().getName()
        );
    }

    public byte[] buildPdf(String filename, String hash, String vaultsageId,
                           LocalDateTime certifiedAt, String creatorName) throws Exception {
        try (PDDocument doc = new PDDocument()) {
            PDPage page = new PDPage(PDRectangle.A4);
            doc.addPage(page);

            try (PDPageContentStream cs = new PDPageContentStream(doc, page)) {
                float w = PDRectangle.A4.getWidth();
                float h = PDRectangle.A4.getHeight();

                // Background
                cs.setNonStrokingColor(new PDColor(new float[]{0.98f, 0.96f, 1.0f}, PDDeviceRGB.INSTANCE));
                cs.addRect(0, 0, w, h);
                cs.fill();

                // Purple header bar
                cs.setNonStrokingColor(new PDColor(new float[]{0.49f, 0.36f, 0.94f}, PDDeviceRGB.INSTANCE));
                cs.addRect(0, h - 100, w, 100);
                cs.fill();

                // Title
                cs.setNonStrokingColor(new PDColor(new float[]{1f, 1f, 1f}, PDDeviceRGB.INSTANCE));
                cs.beginText();
                cs.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD), 24);
                cs.newLineAtOffset(50, h - 55);
                cs.showText("FolioSage Creation Certificate");
                cs.endText();

                cs.beginText();
                cs.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA), 11);
                cs.newLineAtOffset(50, h - 80);
                cs.showText("Proof of Original Creation");
                cs.endText();

                // Body
                cs.setNonStrokingColor(new PDColor(new float[]{0.1f, 0.1f, 0.1f}, PDDeviceRGB.INSTANCE));

                String[] labels = { "Creator", "File Name", "Certified At", "SHA-256 Hash", "VaultSage File ID" };
                String[] values = {
                    creatorName,
                    filename,
                    certifiedAt.format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")) + " UTC",
                    hash,
                    vaultsageId
                };

                float y = h - 150;
                for (int i = 0; i < labels.length; i++) {
                    cs.beginText();
                    cs.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD), 10);
                    cs.newLineAtOffset(50, y);
                    cs.showText(labels[i] + ":");
                    cs.endText();

                    cs.beginText();
                    cs.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA), 10);
                    cs.newLineAtOffset(160, y);
                    String val = values[i] != null ? values[i] : "";
                    String displayVal = val.length() > 64 ? val.substring(0, 64) : val;
                    cs.showText(displayVal);
                    cs.endText();

                    if (labels[i].equals("SHA-256 Hash") && val.length() > 64) {
                        cs.beginText();
                        cs.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA), 10);
                        cs.newLineAtOffset(160, y - 14);
                        cs.showText(val.substring(64));
                        cs.endText();
                        y -= 14;
                    }

                    y -= 30;
                }

                // Footer
                cs.setNonStrokingColor(new PDColor(new float[]{0.49f, 0.36f, 0.94f}, PDDeviceRGB.INSTANCE));
                cs.addRect(0, 0, w, 40);
                cs.fill();

                cs.setNonStrokingColor(new PDColor(new float[]{1f, 1f, 1f}, PDDeviceRGB.INSTANCE));
                cs.beginText();
                cs.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA), 9);
                cs.newLineAtOffset(50, 15);
                cs.showText("Generated by FolioSage · Powered by VaultSage API · foliosage.app");
                cs.endText();
            }

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            doc.save(out);
            return out.toByteArray();
        }
    }
}
