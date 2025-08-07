import mongoose, { Document, Schema } from 'mongoose';

export interface IWorkspace extends Document {
  name: string;
  owner: mongoose.Schema.Types.ObjectId;
  members: { user: mongoose.Schema.Types.ObjectId; role: string; }[];
  createdAt: Date;
  updatedAt: Date;
}

const WorkspaceSchema: Schema = new Schema({
  name: { type: String, required: true },
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  members: [
    {
      user: { type: Schema.Types.ObjectId, ref: 'User' },
      role: { type: String, enum: ['owner', 'admin', 'member', 'guest'], default: 'member' },
    }
  ],
}, { timestamps: true });

const Workspace = mongoose.models.Workspace || mongoose.model<IWorkspace>('Workspace', WorkspaceSchema);

export default Workspace;