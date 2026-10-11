package com.app.usermanagement.dto;

import com.app.usermanagement.entity.UserStatus;
import jakarta.validation.constraints.NotNull;

public class StatusUpdateRequest {

    @NotNull(message = "Le statut est obligatoire")
    private UserStatus statut;

    public StatusUpdateRequest() {
    }

    public StatusUpdateRequest(UserStatus statut) {
        this.statut = statut;
    }

    public UserStatus getStatut() {
        return statut;
    }

    public void setStatut(UserStatus statut) {
        this.statut = statut;
    }
}
