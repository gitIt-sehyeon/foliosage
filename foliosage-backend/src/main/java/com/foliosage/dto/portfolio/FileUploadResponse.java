package com.foliosage.dto.portfolio;
import java.util.UUID;
public record FileUploadResponse(UUID fileId, String name, String fileHash,
                                 String vaultsageFileId) {}
