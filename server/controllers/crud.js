// Factory for the plain resources (projects, qualifications).
// `fields` is an allow-list so a client can't set _id, timestamps, etc. (mass assignment).
export function makeCrud(Model, { label, fields, sort = { createdAt: -1 } }) {
  const pick = (body = {}) =>
    Object.fromEntries(fields.filter((f) => body[f] !== undefined).map((f) => [f, body[f]]));

  const notFound = (res) => res.status(404).json({ message: `${label} not found.` });

  return {
    list: async (_req, res) => {
      res.json(await Model.find().sort(sort));
    },

    get: async (req, res) => {
      const doc = await Model.findById(req.params.id);
      if (!doc) return notFound(res);
      res.json(doc);
    },

    create: async (req, res) => {
      const doc = await Model.create(pick(req.body));
      res.status(201).json(doc);
    },

    update: async (req, res) => {
      const doc = await Model.findById(req.params.id);
      if (!doc) return notFound(res);
      doc.set(pick(req.body));
      await doc.save(); // save() so validators run with full context
      res.json(doc);
    },

    remove: async (req, res) => {
      const doc = await Model.findByIdAndDelete(req.params.id);
      if (!doc) return notFound(res);
      res.json({ message: `${label} deleted.`, id: doc.id });
    }
  };
}