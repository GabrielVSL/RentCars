package com.aluguel.utils;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("Testes de Unidade - Validador Oficial de CNH (Módulo 11)")
class CnhValidatorTest {

    @Test
    @DisplayName("Deve validar com sucesso a CNH oficial de teste (52798802310)")
    void deveValidarCnhOficialValida() {
        assertTrue(CnhValidator.isValid(CnhValidator.CNH_TESTE_OFICIAL));
        assertTrue(CnhValidator.isValid("527.988.023-10"));
        assertTrue(CnhValidator.isValid("12345678900"));
    }

    @Test
    @DisplayName("Deve rejeitar CNH nula ou com tamanho incorreto")
    void deveRejeitarTamanhoInvalido() {
        assertFalse(CnhValidator.isValid(null));
        assertFalse(CnhValidator.isValid(""));
        assertFalse(CnhValidator.isValid("123456789"));
        assertFalse(CnhValidator.isValid("123456789012"));
    }

    @Test
    @DisplayName("Deve rejeitar sequências triviais repetidas")
    void deveRejeitarSequenciasRepetidas() {
        assertFalse(CnhValidator.isValid("11111111111"));
        assertFalse(CnhValidator.isValid("00000000000"));
        assertFalse(CnhValidator.isValid("99999999999"));
    }

    @Test
    @DisplayName("Deve rejeitar CNH com dígitos verificadores matematicamente incorretos")
    void deveRejeitarDigitoVerificadorInvalido() {
        assertFalse(CnhValidator.isValid("52798802300")); // DV2 alterado
        assertFalse(CnhValidator.isValid("52798802319")); // DV1 alterado
        assertFalse(CnhValidator.isValid("12345678901"));
    }
}
