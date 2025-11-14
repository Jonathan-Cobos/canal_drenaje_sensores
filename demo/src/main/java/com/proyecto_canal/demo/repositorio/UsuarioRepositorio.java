package com.proyecto_canal.demo.repositorio;

import com.proyecto_canal.demo.modelo.UsuarioModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface UsuarioRepositorio extends JpaRepository<UsuarioModel, Long> {
    List<UsuarioModel> findByFecha(LocalDate fecha);
    List<UsuarioModel> findByTipoAlerta(UsuarioModel.TipoAlerta tipoAlerta);
    List<UsuarioModel> findBySensorId(String sensorId);
}
