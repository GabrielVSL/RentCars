package com.aluguel.utils;

/**
 * Validador oficial de CNH (Carteira Nacional de Habilitação) brasileira.
 * Implementa o algoritmo oficial de Módulo 11 com 11 dígitos e cálculo de dois dígitos verificadores (DV1 e DV2).
 */
public final class CnhValidator {

    // CNH oficial válida de teste para uso por recrutadores e testes de ponta a ponta
    public static final String CNH_TESTE_OFICIAL = "52798802310";

    private CnhValidator() {
        // Utilitário estático
    }

    /**
     * Valida matematicamente se o número informado é uma CNH válida de 11 dígitos.
     *
     * @param cnh String contendo o número da CNH (com ou sem formatação/espaços).
     * @return true se a CNH for matematicamente válida segundo o Módulo 11; false caso contrário.
     */
    public static boolean isValid(String cnh) {
        if (cnh == null) {
            return false;
        }

        // Remove caracteres não numéricos
        String cleanCnh = cnh.replaceAll("\\D", "");

        // A CNH deve conter exatamente 11 dígitos
        if (cleanCnh.length() != 11) {
            return false;
        }

        // Rejeita sequências repetidas triviais (ex: 11111111111, 00000000000)
        if (cleanCnh.matches("(\\d)\\1{10}")) {
            return false;
        }

        char[] chars = cleanCnh.toCharArray();

        // -----------------------------------------------------------------
        // 1. Cálculo do 1º Dígito Verificador (DV1) - Pesos decrescentes de 9 a 1
        // -----------------------------------------------------------------
        int soma1 = 0;
        int peso1 = 9;
        for (int i = 0; i < 9; i++) {
            soma1 += Character.getNumericValue(chars[i]) * peso1;
            peso1--;
        }

        int resto1 = soma1 % 11;
        int dv1;
        int incrementoDesconto = 0;

        if (resto1 < 10) {
            dv1 = resto1;
        } else {
            dv1 = 0;
            incrementoDesconto = 2;
        }

        // -----------------------------------------------------------------
        // 2. Cálculo do 2º Dígito Verificador (DV2) - Pesos crescentes de 1 a 9
        // -----------------------------------------------------------------
        int soma2 = 0;
        int peso2 = 1;
        for (int i = 0; i < 9; i++) {
            soma2 += Character.getNumericValue(chars[i]) * peso2;
            peso2++;
        }

        int resto2 = (soma2 - incrementoDesconto) % 11;
        if (resto2 < 0) {
            resto2 += 11;
        }

        int dv2 = (resto2 < 10) ? resto2 : 0;

        // -----------------------------------------------------------------
        // 3. Validação dos Dígitos Informados
        // -----------------------------------------------------------------
        int dv1Informado = Character.getNumericValue(chars[9]);
        int dv2Informado = Character.getNumericValue(chars[10]);

        return (dv1 == dv1Informado) && (dv2 == dv2Informado);
    }
}
