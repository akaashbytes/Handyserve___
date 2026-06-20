package com.handyserve.mapper;

import com.handyserve.dto.PromoCodeDto;
import com.handyserve.entity.PromoCode;

public class PromoCodeMapper {
    public static PromoCodeDto fromEntity(PromoCode entity) {
        if (entity == null) return null;
        return PromoCodeDto.builder()
                .id(entity.getId())
                .code(entity.getCode())
                .label(entity.getLabel())
                .type(entity.getType().name())
                .value(entity.getValue())
                .active(entity.getActive())
                .expiresAt(entity.getExpiresAt())
                .build();
    }
}
