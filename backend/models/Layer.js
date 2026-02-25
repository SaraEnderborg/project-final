import mongoose, { Schema } from "mongoose";

const LayerSchema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    region: {
      type: String,
      enum: ["Europe"],
      default: "Europe",
      required: true,
    },

    rangeStart: { type: Date, required: true },
    rangeEnd: { type: Date, required: true },

    categories: {
      type: [String],
      required: true,
    },

    isPublic: { type: Boolean, default: true },
    ownerId: { type: Schema.Types.ObjectId, ref: "User", index: true },
  },
  { timestamps: true },
);

LayerSchema.index({ isPublic: 1, ownerId: 1 });

export default mongoose.model("Layer", LayerSchema);
