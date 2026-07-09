function renderTemplate(template, params) {
  return Object.entries(params).reduce((result, [key, value]) => {
    return result.replace(new RegExp(`\\{${key}\\}`, "g"), encodeURIComponent(String(value)));
  }, template);
}

module.exports = {
  renderTemplate,
};
