package com.proyecto_canal.demo.modelo;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "sensores")
public class UsuarioModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "fecha", nullable = false)
    private LocalDate fecha;

    @Column(name = "sensor_id", nullable = false, length = 20)
    private String sensorId;

    @Column(name = "nivel_agua_cm", nullable = false)
    private Integer nivelDeAguaCm;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_alerta", nullable = false, length = 10)
    private TipoAlerta tipoAlerta;

    public UsuarioModel() {}

    public UsuarioModel(LocalDate fecha, String sensorId, Integer nivelDeAguaCm, TipoAlerta tipoAlerta) {
        this.fecha = fecha;
        this.sensorId = sensorId;
        this.nivelDeAguaCm = nivelDeAguaCm;
        if (tipoAlerta == null) {
            calcularTipoAlerta();
        } else {
            this.tipoAlerta = tipoAlerta;
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public LocalDate getFecha() { return fecha; }
    public void setFecha(LocalDate fecha) { this.fecha = fecha; }

    public String getSensorId() { return sensorId; }
    public void setSensorId(String sensorId) { this.sensorId = sensorId; }

    public Integer getNivelDeAguaCm() { return nivelDeAguaCm; }
    public void setNivelDeAguaCm(Integer nivelDeAguaCm) {
        this.nivelDeAguaCm = nivelDeAguaCm;
        calcularTipoAlerta();
    }

    public TipoAlerta getTipoAlerta() { return tipoAlerta; }
    public void setTipoAlerta(TipoAlerta tipoAlerta) { this.tipoAlerta = tipoAlerta; }

    public void calcularTipoAlerta() {
        if (this.nivelDeAguaCm == null) return;
        this.tipoAlerta = TipoAlerta.fromNivel(this.nivelDeAguaCm);
    }

    @Override
    public String toString() {
        return "Reporte{id=" + id + ", fecha=" + fecha + ", sensorId='" + sensorId + '\'' +
               ", nivelDeAguaCm=" + nivelDeAguaCm + ", tipoAlerta=" + tipoAlerta + '}';
    }

    public enum TipoAlerta {
        BAJA, MEDIA, ALTA;

        public static TipoAlerta fromNivel(int nivel) {
            if (nivel <= 50) return BAJA;
            if (nivel <= 120) return MEDIA;
            return ALTA;
        }
    }
}
