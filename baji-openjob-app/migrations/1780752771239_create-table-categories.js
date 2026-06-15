export const up = (pgm) => {
  pgm.createTable('categories', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    name: {
      type: 'VARCHAR(255)',
      notNull: true,
    },
  });
};

export const down = (pgm) => {
  pgm.dropTable('categories');
};