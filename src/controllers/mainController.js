const controller = {
  index: (req, res) => {
    const nombre = "Oscar";
    res.render("index", { nombre: nombre });
  }
};

export default controller;
