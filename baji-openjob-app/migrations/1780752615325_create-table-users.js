export const up = (pgm) => {
  pgm.createTable('users', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    fullname: {
      type: 'VARCHAR(255)',
      notNull: true,
    },
    email: {
      type: 'VARCHAR(255)',
      notNull: true,
      unique: true, 
},
    password: {
      type: 'TEXT',
      notNull: true,
    },
  });
};

export const down = (pgm) => {
  pgm.dropTable('users');
};