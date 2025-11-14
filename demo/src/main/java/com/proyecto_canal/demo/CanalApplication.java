package com.proyecto_canal.demo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.boot.CommandLineRunner;

import com.proyecto_canal.demo.modelo.UsuarioModel;
import com.proyecto_canal.demo.repositorio.UsuarioRepositorio;
import java.time.LocalDate;

@SpringBootApplication
public class CanalApplication {

	public static void main(String[] args) {
		SpringApplication.run(CanalApplication.class, args);
	}

	// Inserta un sensor de prueba al arrancar (si la tabla está vacía)
	@Bean
	public CommandLineRunner insertarSensorDePrueba(UsuarioRepositorio repo) {
		return args -> {
			try {
				if (repo.count() == 0) {
					UsuarioModel prueba = new UsuarioModel();
					prueba.setFecha(LocalDate.now());
					prueba.setSensorId("TEST-001");
					prueba.setNivelDeAguaCm(75);
					prueba.calcularTipoAlerta();
					repo.save(prueba);
					System.out.println("[CanalApplication] Sensor de prueba insertado: TEST-001");
				} else {
					System.out.println("[CanalApplication] La tabla ya tiene datos, no se inserta el sensor de prueba.");
				}
			} catch (Exception ex) {
				System.err.println("[CanalApplication] Error al insertar sensor de prueba: " + ex.getMessage());
			}
		};
	}

}
