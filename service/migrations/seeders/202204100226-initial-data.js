'use strict';
const bcryptjs = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const Utils = require('../../src/utils');

const ADMIN_USER = process.env.CONFIG_ADMIN_USER || 'test@gmail.com';
const HASH_SIZE = process.env.CONFIG_HASH_SIZE || 10;

const ROL_ID = uuidv4();
const INITIAL_PASSWORD  = process.env.CONFIG_ADMIN_PASSWORD || 'admin';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    const created_at = new Date();

    try {
      // ? ROLES
      await queryInterface.bulkInsert('roles', [
        {
          id: ROL_ID,
          group: 'admin',
          name: 'Usuarios Administradores',
          permissions: JSON.stringify([
            {
              actions: ['manage'],
              subject: ['all'],
            },
          ]),
          status: 1,
          created_at,
          updated_at: created_at,
        },
      ], { transaction, returning: true });

      // ? USERS
      await queryInterface.bulkInsert('users', [
        {
          id: uuidv4(),
          rol_id: ROL_ID,
          username: 'admin',
          email: ADMIN_USER,
          password: await bcryptjs.hash(
            INITIAL_PASSWORD,
            parseInt(HASH_SIZE, 10)
          ),
          full_name: 'Administrador',
          status: 1,
          created_at,
          updated_at: created_at,
        }
      ], { transaction, returning: true });

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(transaction => {
      return Promise.all([
        queryInterface.bulkDelete('roles', null, { transaction }),
        queryInterface.bulkDelete('users', null, { transaction }),
      ]);
    });
  }
};
