export const up = (pgm) => {
  pgm.createTable('jobs', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    job_type:{
      type: 'VARCHAR(50)',
      notNull: true,
    },
    experience_level: {
      type: 'VARCHAR(50)',
    },
    location_type: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    location_city: {
      type: 'VARCHAR(100)',
    },
    salary_min: {
      type: 'INT',
    },
    salary_max: {
      type: 'INT',
    },
    is_salary_visible: {
      type: 'BOOLEAN',
      default: false,
    },
    status: {
      type: 'VARCHAR(50)',
      notNull: true,
      default: 'open',
    },
    title: {
      type: 'VARCHAR(255)',
      notNull: true,
    },
    description: {
      type: 'TEXT',
      notNull: true,
    },
    company_id: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: '"companies"',
      onDelete: 'cascade',
    },
    category_id: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: '"categories"',
      onDelete: 'cascade',
    },
  });

  pgm.createIndex('jobs', 'company_id');
  pgm.createIndex('jobs', 'category_id');
};

export const down = (pgm) => {
  pgm.dropTable('jobs');
};