export const up = (pgm) => {
  pgm.createTable('bookmarks', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    user_id: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    job_id: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
  });
};

export const down = (pgm) => {
  pgm.dropTable('bookmarks');
};