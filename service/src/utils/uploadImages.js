/**
 * Carga de imágenes local
 */
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require('uuid');

/**
 * Se intenta almacenar una imagen de forma local y generarle un nombre único.
 * @param file que se va almacenar localmente.
 * @returns Devuelve una respuesta {ok,message,data:Url del imagen} con el resultado de la operación.
 */
const uploadImage = async (key, file) => {

    // Validar extension
    const fileNameSegments = file.originalname.split('.'); // archivo.ejemplo.ext
    const fileExtension = fileNameSegments[fileNameSegments.length - 1]; // .ext

    let validateExtensions = ['pdf', 'png', 'jpg', 'jpeg'];

    if (!validateExtensions.includes(fileExtension)) {
        throw new Error(`La extensión ${fileExtension} del archivo ${key}  no es válida. Las extensiones válidas son: ${validateExtensions.join(', ')}`);
    }

    // Generar el nombre del archivo
    const filename = `${uuidv4()}.${fileExtension}`;
    // Path para guardar a imagen
    // const path = `uploads/${filename}`;
    const path = `../service/public/uploads/${filename}`;

    try {
        // Mover la imagen
        fs.writeFile(path, file.buffer, (err) => {
          if (err) {
            throw new Error(`No se puede cargar el archivo ${key}`);
          }
        });

        // Si todo está correcto, devuelve la ruta de donde se guardó
        return path.split("..")[1].substring(1).replace("service/public/", "");
    } catch (error) {
        throw new Error(`No se puede cargar el archivo ${key}`);
    }
}

// /**
//  * Intenta eliminar una imagen local desde la ruta local del archivo.
//  * @param path Dirección local de la imagen que se quiere eliminar.
//  * @returns Devuelve una respuesta (ok, message, data) con el resultado de la operación.
//  */
// const deleteImage = path => {
//     if (fs.existsSync(path)) {

//       fs.unlinkSync(path);
//       return {
//         result: true,
//         message: "Imagen eliminada correctamente.",
//         path
//       };
//     }

//     return {
//       result: false,
//       message: "La imagen no existe o ya fue eliminada.",
//       data: null
//     };
// }

// const getImage = (fileName) => {
//   let pathImg = path.join(__dirname, `../service/public/uploads/${fileName}`);

//   return {
//     data: pathImg
//   };
// };

module.exports = {
  uploadImage,
  // deleteImage,
  // getImage,
};