// Initializes the `deportistas` service on path `/deportistas`
const { Deportistas } = require('./deportistas.class');
const createModel = require('../../models/deportistas.model');
const hooks = require('./deportistas.hooks');
const multer = require('multer');
const upload = multer();
const { uploadImage } = require('../../utils/uploadImages');

const Schema = require('../../schemas/deportistas.schema');

module.exports = function (app) {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate'),
    multi: ['patch']
  };

  // Initialize our service with any options it requires
  app.use('/deportistas', upload.fields([
    { name: 'foto', maxCount: 1 },
    { name: 'fotoCardex', maxCount: 1 },
    { name: 'fotoIdentificacionOficial', maxCount: 1 },
  ]), async (req, _res, next) => {
    if (req.method === 'POST') {
      const { error } = Schema.POST_SCHEMA.validate(req.body);

      if (error) {
        return next(error);
      } else {
        // ? Check if files are present in the request
        if (!(Object.keys(req.files).length === 3)) {
          const aFiles = ['foto', 'fotoCardex', 'fotoIdentificacionOficial'];

          try {
            throw new Error(`No se puede crear el deportista, faltan datos (archivos de imagen): ${
              aFiles.filter(file => !(Object.keys(req.files).find(field => field === file))).join(', ')
          }.`);
          } catch (err) {
            next(err);
          }
        }

        // ? Validate unique expediente
        const { expediente } = req.body;

        const deportista = await app.service('deportistas').find({
          paginate: false,
          query: {
            expediente
          }
        });

        if (deportista.length > 0) {
          try {
            throw new Error(`El deportista con el expediente ${expediente} ya existe.`);
          } catch (err) {
            next(err);
          }
        } 

        // ? Upload files
        try {
          const foto = await uploadImage("foto", req.files.foto[0]);
          const fotoCardex = await uploadImage("fotoCardex", req.files.fotoCardex[0]);
          const fotoIdentificacionOficial = await uploadImage("fotoIdentificacionOficial", req.files.fotoIdentificacionOficial[0]);

          req.body.foto = foto;
          req.body.fotoCardex = fotoCardex;
          req.body.fotoIdentificacionOficial = fotoIdentificacionOficial;

        } catch (err) {
          next(err);
        }
      }
    }

    next();
  }, new Deportistas(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('deportistas');

  service.hooks(hooks);
};
