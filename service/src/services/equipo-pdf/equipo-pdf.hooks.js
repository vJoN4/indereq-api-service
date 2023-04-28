const { authenticate } = require('@feathersjs/authentication').hooks;
const fs = require('fs');
const path = require('path');
const PdfkitConstruct = require('pdfkit-construct');
const { v4: uuidv4 } = require('uuid');

const builPDF = (equipo, deportistas) => {
  const pdf = new PdfkitConstruct({
    size: 'A4',
    bufferPages: true,
  });

  pdf.setDocumentHeader({height: '28%'}, () => {
    pdf.image('public/assets/img/logoSEP.png', 180, 25, {width: 150})
    pdf.image('public/assets/img/logoConade.png', 350, 30, {width: 120})
    pdf.image('public/assets/img/logoFisu.png', 490, 30, {width: 35})
    pdf.moveDown();
    pdf.font('Helvetica-Bold').fontSize(10).fillColor('#8C2E40').text('CONSEJO NACIONAL DEL DEPORTE DE LA EDUCACIÓN, A.C.').moveDown(0.5);
    pdf.font('Helvetica-Bold').fontSize(18).fillColor('black').text(`${equipo.facultad} ${new Date().getFullYear()}`);
    pdf.font('Helvetica').fontSize(10).fillColor('black').text('CÉDULA DE INSCRIPCIÓN');
    pdf.moveDown();
    pdf.font('Helvetica-Bold').fontSize(18).fillColor('#8C2E40').text(equipo.nombre);
    pdf.moveDown();

    //Creacion de la primera Tabla de los datos generales
    pdf.rect(pdf.x, 170, 150, 20).stroke();
    pdf.font('Helvetica').fontSize(10).fillColor('black').text(`REGIÓN |`, 78, 177);
    pdf.rect(pdf.x + 144, 170, 303, 20).stroke();
    pdf.font('Helvetica').fontSize(10).fillColor('black').text(`ESTADO |`, 230, 177);
    pdf.rect(pdf.x - 158, 190, 453, 20).stroke();
    pdf.font('Helvetica').fontSize(10).fillColor('black').text(`INSTITUCIÓN |`, 78, 197); //Facultad
    pdf.rect(pdf.x - 6, 210, 200, 20).stroke();
    pdf.font('Helvetica').fontSize(10).fillColor('black').text(`SIGLA IES |`, 78, 217);
    pdf.rect(pdf.x + 194, 210, 126, 20).stroke();
    pdf.rect(pdf.x + 320, 210, 127, 20).stroke();
    pdf.font('Helvetica').fontSize(10).fillColor('black').text(`VARONIL |`, 280, 217);
    pdf.font('Helvetica').fontSize(10).fillColor('black').text(`FEMENIL |`, 405, 217);

    pdf.font('Helvetica').fontSize(12).fillColor('black').text('');
  });

  //Tabla que muestra los deportistas 
  pdf.addTable(
    [
      {key: 'numberRow', label: '', align: 'center'},
      {key: 'apellidos', label: '             APELLIDOS             ', align: 'center'},
      {key: 'nombres',   label: '       NOMBRES        ', align: 'center'},
      {key: 'numJugador', label: 'NÚMERO'},
    ],
    deportistas, {
      width: "fill_body",
      border : {size: 0.1, color: '#707475'},
      marginLeft: 60,
      marginRight: 60,
      headAlign: 'center',
      headFont : "Helvetica-Bold",
      headHeight : 16,
      headBackground : '#707475',
      headColor : '#fff',
      cellsFont : "Helvetica",
      marginBottom : 10,
    }
  );

  //Tabla que muestra los datos del entrenados y asistente.
  pdf.addTable(
    [
        {key: 'numberRow', label: '', align: 'left'},
        {key: 'apellidos', label: '             APELLIDOS            ', align: 'center'},
        {key: 'nombres',   label: '             NOMBRES              ', align: 'center'},
    ],
    [
      {"numberRow": "ENTRENADOR(A)", "apellidos": equipo.apellidoEntrenador, "nombres": equipo.nombreEntrenador,},  //Aqui es donde se debe colocar el nombre y apellido del entrenador para que se muestren en la tabla.
      {"numberRow": "ASISTENTE", "apellidos": equipo.apellidoAsistente, "nombres":equipo.nombreAsistente,} //Aqui es donde se debe colocar el nombre y apellido del asistente para que se muestren en la tabla.
    ], {
      width: "fill_body",
      border : {size: 0.1, color: '#707475'},
      marginLeft: 60,
      marginRight: 60,
      headAlign: 'center',
      headFont : "Helvetica-Bold",
      headHeight : 16,
      headBackground : '#707475',
      headColor : '#fff',
      cellsFont : "Helvetica",
    }
    
  );

  pdf.setDocumentFooter({
    height : "10%"
  }, () => {
    pdf.font('Helvetica').fontSize(10).text('______________________________________', pdf.footer.x + 60, pdf.footer.y - 14)
    pdf.font('Helvetica').fontSize(10).text('COORDINADOR GENERAL DE LA REGIÓN', pdf.footer.x + 64, pdf.footer.y)
    pdf.font('Helvetica').fontSize(10).text('________________________________', pdf.footer.x + 334, pdf.footer.y - 14)
    pdf.font('Helvetica').fontSize(10).text('DELEGADO ESTATAL DEL CONDDE', pdf.footer.x + 340, pdf.footer.y)
  });
  // render tables
  pdf.render();

  const sFileName = `equipo-${uuidv4()}.pdf`;
  pdf.pipe(fs.createWriteStream(path.join(__dirname, '../../../public/pdf/', sFileName)));

  pdf.end();

  return sFileName;
};

module.exports = {
  before: {
    all: [ authenticate('jwt') ],
    find: [],
    get: [],
    create: [async context => {
      const { data } = context;

      if (data?.id) {
        const equipoData = await context.app.service('equipos').get(data.id);

        if (equipoData) {
          const deportistas = await context.app.service('deportistas').find({
            query: {
              equipo_id: equipoData.id,
            }
          });

          const aJugadores = deportistas.data.map((d, i) => ({
            numberRow: i + 1,
            apellidos: d.apellidos,
            nombres: d.nombres,
            numJugador: d.numJugador || '',
          }));

          const pdf = await builPDF(equipoData, aJugadores);

          context.result = {}
          context.result.pdf = pdf;

        } else {
          throw new errors.BadRequest('No se encontró el equipo.');
        }
      }

      return context;
    }],
    update: [],
    patch: [],
    remove: []
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
};
