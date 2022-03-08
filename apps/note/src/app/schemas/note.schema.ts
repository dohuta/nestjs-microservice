import * as mongoose from 'mongoose';
import { INote } from '../interfaces/note.interface';

function transformValue(doc, ret: { [key: string]: any }) {
  delete ret._id;
}

export const NoteSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name can not be empty'],
    },
    content: String,
    user_id: {
      type: String,
      required: [true, 'User can not be empty'],
    },
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
    toObject: {
      virtuals: true,
      versionKey: false,
      transform: transformValue,
    },
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: transformValue,
    },
  }
);

NoteSchema.pre('validate', function (next) {
  const self = this as INote;

  if (this.isModified('user_id') && self.created_at) {
    this.invalidate('user_id', 'The field value can not be updated');
  }
  next();
});
