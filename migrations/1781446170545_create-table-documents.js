export const up = (pgm) => {
  pgm.createTable('documents', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    user_id: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: '"users"',
      onDelete: 'CASCADE',
    },
    filename: {
      type: 'VARCHAR(255)',
      notNull: true,
    },
    original_name: {
      type: 'VARCHAR(255)',
    },
    size: {
      type: 'INTEGER',
    },
    created_at: {
      type: 'TIMESTAMP',
      default: pgm.func('NOW()'),
    },
  });
};

export const down = (pgm) => {
  pgm.dropTable('documents');
};
