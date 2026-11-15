export function validate(schema, source = 'body') {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) return next(result.error);
    req.validated = { ...req.validated, [source]: result.data };
    if (source !== 'query') req[source] = result.data;
    return next();
  };
}
