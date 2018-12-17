'use strict';
exports.up = async function (knex) {
    try{
        const hasUser = await knex
            .schema
            .hasTable('user');

        if (!hasUser)
            await knex
                .schema
                .createTable('user', table => {
                    table.increments('id').primary().unsigned();
                    table.string('first_name');
                    table.string('last_name');
                    table.string('email');
                    table.string('phone');
                    table.string('password').notNullable();
                    table.string('username').notNullable();
                });

        const hasToken = await knex
            .schema
            .hasTable('token');

        if (!hasToken)
            await knex
                .schema
                .createTable('token', table => {
                    table.increments('id').primary().unsigned();
                    table.string('token');
                    table.dateTime('expires');
                    table.integer('user_id').unsigned().notNullable();
                    table.foreign('user_id').references('user.id')
                        .onDelete('CASCADE')
                        .onUpdate('CASCADE');
                });
    }
    catch (e) {
        console.log('knex migrations failed with error ', e);
    }
};

exports.down = async function (knex) {
    await knex.schema
        .dropTable('token')
        .dropTable('user')
};