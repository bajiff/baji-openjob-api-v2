import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import upload from '../../middlewares/upload.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default class DocumentsHandler {
  constructor(service) {
    this._service = service;

    this.postDocumentHandler = this.postDocumentHandler.bind(this);
    this.getDocumentsHandler = this.getDocumentsHandler.bind(this);
    this.getDocumentByIdHandler = this.getDocumentByIdHandler.bind(this);
    this.deleteDocumentByIdHandler = this.deleteDocumentByIdHandler.bind(this);
  }

  postDocumentHandler(req, res, next) {
    upload.single('document')(req, res, async (err) => {
      if (err || !req.file) {
        return res.status(400).json({
          status: 'failed',
          message: err ? err.message : 'File is required',
        });
      }

      try {
        const { filename, originalname, size } = req.file;
        const userId = req.user.id;

        const result = await this._service.addDocument({
          userId,
          filename,
          originalName: originalname,
          size,
        });

        return res.status(201).json({
          status: 'success',
          data: result,
        });
      } catch (error) {
        next(error);
      }
    });
  }

  async getDocumentsHandler(req, res, next) {
    try {
      const documents = await this._service.getDocuments();
      return res.status(200).json({
        status: 'success',
        data: { documents },
      });
    } catch (error) {
      next(error);
    }
  }

  async getDocumentByIdHandler(req, res, next) {
    try {
      const doc = await this._service.getDocumentById(req.params.id);
      const filePath = path.resolve(
        __dirname,
        '../../../uploads/documents',
        doc.filename
      );

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `inline; filename="${doc.original_name}"`
      );

      res.sendFile(filePath, (err) => {
        if (err) {
          return res.status(404).json({
            status: 'failed',
            message: 'File not found on disk',
          });
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteDocumentByIdHandler(req, res, next) {
    try {
      const doc = await this._service.deleteDocumentById(req.params.id);

      // Hapus file fisik
      const filePath = path.resolve(
        __dirname,
        '../../../uploads/documents',
        doc.filename
      );
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

      return res.status(200).json({
        status: 'success',
        message: 'Document deleted',
      });
    } catch (error) {
      next(error);
    }
  }
}
