var express = require("express");
const fileUpload = require("express-fileupload");
var fs = require("fs");
var Usuario = require("../models/usuario");
var Medico = require("../models/medico");
var Hospital = require("../models/hospital");

var app = express();

app.use(fileUpload());

// Rutas
app.put("/:tipo/:id", (req, res, next) => {
    var tipo = req.params.tipo;
    var id = req.params.id;

    // Tipos de coleccion
    var tiposValidos = ["hospitales", "medicos", "usuarios"];
    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: "Tipo de coleccion invalida",
            errors: {
                message: "Tipo no valido"
            }
        });
    }

    if (!req.files) {
        return res.status(400).json({
            ok: false,
            mensaje: "Imagen no seleccionada",
            errors: {
                message: "Debe seleccionar una imagen"
            }
        });
    }

    // Obtener nombre del archivo
    var archivo = req.files.imagen;
    var nombreCortado = archivo.name.split(".");
    var extensionArchivo = nombreCortado[nombreCortado.length - 1];

    // Extensiones validas
    var extensionesValidas = ["png", "jpg", "jpeg", "gif"];

    if (extensionesValidas.indexOf(extensionArchivo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: "Extension de imagen invalida",
            errors: {
                message: "Extension de imagen no permitida " + extensionesValidas.join(", ")
            }
        });
    }

    // Nombre de archivo personalizado
    var nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extensionArchivo}`;

    // Mover el archivo a un path
    var path = `./uploads/${tipo}/${nombreArchivo}`;

    archivo.mv(path, err => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error al mover archivo",
                errors: err
            });
        }
        subirPorTipo(tipo, id, nombreArchivo, res);
        /*  res.status(200).json({
                ok: true,
                mensaje: "Archivo Movido"
            }); */
    });
});

function subirPorTipo(tipo, id, nombreArchivo, res) {
    if (tipo === "usuarios") {
        Usuario.findById(id, (err, usuario) => {

            if (!usuario) {
                return res.status(400).json({
                    ok: true,
                    mensaje: "El usuario no existe",
                    errors: {
                        message: 'Usuario no existe'
                    }
                });
            }
            var pathViejo = './uploads/usuarios/' + usuario.img;

            // Si existe elimina la imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlinkSync(pathViejo);
            }

            usuario.img = nombreArchivo;


            usuario.save((err, usuarioActualizado) => {
                usuarioActualizado.password = ':)';
                return res.status(200).json({
                    ok: true,
                    mensaje: "imagen de usuario actualizada",
                    usuario: usuarioActualizado
                });
            });

        });
    }

    if (tipo === "medicos") {
        Medico.findById(id, (err, medico) => {

            if (!medico) {
                return res.status(400).json({
                    ok: true,
                    mensaje: "El medico no existe",
                    errors: {
                        message: 'medico no existe'
                    }
                });
            }
            var pathViejo = './uploads/medicos/' + medico.img;

            // Si existe elimina la imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlinkSync(pathViejo);
            }

            medico.img = nombreArchivo;

            medico.save((err, medicoActualizado) => {
                return res.status(200).json({
                    ok: true,
                    mensaje: "Imagen de medico actualizada",
                    medico: medicoActualizado
                });
            });

        });
    }

    if (tipo === "hospitales") {
        Hospital.findById(id, (err, hospital) => {

            if (!hospital) {
                return res.status(400).json({
                    ok: true,
                    mensaje: "El hospital no existe",
                    errors: {
                        message: 'hospital no existe'
                    }
                });
            }
            var pathViejo = './uploads/hospitales/' + hospital.img;

            // Si existe elimina la imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlinkSync(pathViejo);
            }

            hospital.img = nombreArchivo;

            hospital.save((err, hospitalActualizado) => {
                return res.status(200).json({
                    ok: true,
                    mensaje: "imagen de hospital actualizado",
                    hospital: hospitalActualizado
                });
            });

        });
    }
}
module.exports = app;