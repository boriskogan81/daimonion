exports.seed = async (knex) => {
    try {
        if (knex.processFlag !== 'test')
            return;
        // Deletes ALL existing entries
        await knex('user').del();
        
        await knex('user').insert([
            {
                id: 1,
                first_name: 'Ploni',
                last_name: 'Almoni',
                email: 'plonialmoni@gmail.com',
                phone: '123456789',
                password: `password`,
                username: 'MyLittlePloni'
            }
        ]);

        await knex('token').del();

        await knex('token').insert([
            {
                id: 1,
                token: '12345',
                expires: '2021-01-01 00:00:00',
                user_id: 1
            }
        ]);
    }
    catch (e) {
        console.log('test seed failed with error ', e);
    }
};
