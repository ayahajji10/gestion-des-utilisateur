package com.app.usermanagement.dto;

import com.app.usermanagement.entity.UserRole;
import com.app.usermanagement.entity.UserStatus;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class CreateUserRequest {

    @NotBlank(message = "L'identifiant est obligatoire")
    @Size(min = 2, max = 50, message = "L'identifiant doit contenir entre 2 et 50 caractères")
    @Pattern(regexp = "^[a-zA-Z0-9._-]+$", message = "L'identifiant ne peut contenir que des lettres, chiffres, points, tirets ou underscores")
    private String identifiant;

    @NotBlank(message = "Le nom est obligatoire")
    @Size(min = 2, max = 100, message = "Le nom doit contenir entre 2 et 100 caractères")
    private String nom;

    @NotBlank(message = "Le prénom est obligatoire")
    @Size(min = 2, max = 100, message = "Le prénom doit contenir entre 2 et 100 caractères")
    private String prenom;

    @NotBlank(message = "L'adresse email est obligatoire")
    @Email(message = "Le format de l'adresse email est invalide")
    @Size(max = 150, message = "L'email ne peut pas dépasser 150 caractères")
    private String email;

    @Pattern(regexp = "^(\\+?[0-9\\s.-]{6,25})?$", message = "Le numéro de téléphone est invalide")
    private String telephone;

    @NotNull(message = "Le rôle est obligatoire")
    private UserRole role = UserRole.LECTEUR;

    @NotNull(message = "Le statut est obligatoire")
    private UserStatus statut = UserStatus.ACTIF;

    public CreateUserRequest() {
    }

    public CreateUserRequest(String identifiant, String nom, String prenom, String email,
                             String telephone, UserRole role, UserStatus statut) {
        this.identifiant = identifiant;
        this.nom = nom;
        this.prenom = prenom;
        this.email = email;
        this.telephone = telephone;
        this.role = role;
        this.statut = statut;
    }

    public String getIdentifiant() {
        return identifiant;
    }

    public void setIdentifiant(String identifiant) {
        this.identifiant = identifiant;
    }

    public String getNom() {
        return nom;
    }

    public void setNom(String nom) {
        this.nom = nom;
    }

    public String getPrenom() {
        return prenom;
    }

    public void setPrenom(String prenom) {
        this.prenom = prenom;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getTelephone() {
        return telephone;
    }

    public void setTelephone(String telephone) {
        this.telephone = telephone;
    }

    public UserRole getRole() {
        return role;
    }

    public void setRole(UserRole role) {
        this.role = role;
    }

    public UserStatus getStatut() {
        return statut;
    }

    public void setStatut(UserStatus statut) {
        this.statut = statut;
    }
}
