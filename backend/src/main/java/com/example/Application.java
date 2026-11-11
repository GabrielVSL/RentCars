package com.example;

import io.micronaut.runtime.Micronaut;
import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Contact;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.info.License;

@OpenAPIDefinition(
    info = @Info(
        title = "Apex Track Experience & ApexPay Engine API",
        version = "2.0",
        description = "API de Alta Performance para Gestão de Sessões em Autódromos Internacionais, Motor Financeiro ApexPay e Fila Assíncrona de Alta Concorrência.",
        contact = @Contact(name = "Gabriel VSL - Apex Team", email = "gabriel@apex.com"),
        license = @License(name = "Apache 2.0", url = "https://www.apache.org/licenses/LICENSE-2.0.html")
    )
)
public class Application {

    public static void main(String[] args) {
        Micronaut.run(Application.class, args);
    }
}
