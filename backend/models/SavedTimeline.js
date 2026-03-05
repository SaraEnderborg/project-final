import mongoose from "mongoose";

const SavedTimelineSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },

    config: {
      selectedLayerIds: { type: [String], default: [] },
      categoryByLayerId: { type: mongoose.Schema.Types.Mixed, default: {} },
      yearRange: {
        type: [Number],
        default: [1500, 2000],
        validate: {
          validator: (v) =>
            Array.isArray(v) &&
            v.length === 2 &&
            Number.isFinite(v[0]) &&
            Number.isFinite(v[1]) &&
            v[0] <= v[1],
          message: "yearRange must be [start, end]",
        },
      },
    },

    notes: {
      type: String,
      default: "",
      maxlength: 2000,
    },
  },
  { timestamps: true },
);

SavedTimelineSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model("SavedTimeline", SavedTimelineSchema);
