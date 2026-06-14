export const up = (pgm) => {
  pgm.addColumns('companies', {
    user_id: {
      type: 'VARCHAR(50)',
      references: '"users"',
      onDelete: 'CASCADE',
    },
  });
  pgm.createIndex('companies', 'user_id');
};

export const down = (pgm) => {
  pgm.dropIndex('companies', 'user_id');
  pgm.dropColumns('companies', ['user_id']);
};
