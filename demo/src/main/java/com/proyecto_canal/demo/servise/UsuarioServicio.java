package com.proyecto_canal.demo.servise;

import com.proyecto_canal.demo.modelo.UsuarioModel;
import com.proyecto_canal.demo.repositorio.UsuarioRepositorio;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class UsuarioServicio {

    @Autowired
    private UsuarioRepositorio usuarioRepositorio;

    public List<UsuarioModel> obtenerTodos() {
        return usuarioRepositorio.findAll();
    }

    public List<UsuarioModel> obtenerPorFecha(LocalDate fecha) {
        return usuarioRepositorio.findByFecha(fecha);
    }

    public List<UsuarioModel> obtenerPorTipo(String tipoAlerta) {
        try {
            UsuarioModel.TipoAlerta tipo = UsuarioModel.TipoAlerta.valueOf(tipoAlerta.toUpperCase());
            return usuarioRepositorio.findByTipoAlerta(tipo);
        } catch (IllegalArgumentException e) {
            return List.of();
        }
    }

    public List<UsuarioModel> filtrar(LocalDate fecha, String tipoAlerta) {
        List<UsuarioModel> resultados = obtenerTodos();

        if (fecha != null) {
            resultados = resultados.stream()
                .filter(s -> s.getFecha().equals(fecha))
                .collect(Collectors.toList());
        }

        if (tipoAlerta != null && !tipoAlerta.isEmpty()) {
            try {
                UsuarioModel.TipoAlerta tipo = UsuarioModel.TipoAlerta.valueOf(tipoAlerta.toUpperCase());
                resultados = resultados.stream()
                    .filter(s -> s.getTipoAlerta().equals(tipo))
                    .collect(Collectors.toList());
            } catch (IllegalArgumentException e) {
                // Tipo inválido, retornar lista vacía
            }
        }

        return resultados;
    }

    public UsuarioModel obtenerPorId(Long id) {
        return usuarioRepositorio.findById(id).orElse(null);
    }

    public UsuarioModel guardar(UsuarioModel usuario) {
        return usuarioRepositorio.save(usuario);
    }

    public void eliminar(Long id) {
        usuarioRepositorio.deleteById(id);
    }
}
