import UserDiscountQr from "../models/UserDiscountQr.model.js";

console.log(UserDiscountQr);

const controller = {
  userDiscountQrs_list: (req, res) => {
    UserDiscountQr.find()
      .then((allDiscountQrs) => res.json(allDiscountQrs))
      .catch((error) => {
        console.error(
          "Error al buscar descuentos creados por usuarios: ",
          error
        );
        res
          .status(500)
          .json({ error: "Error al buscar descuentos creados por usuarios" });
      });
  },
  userDiscountQrs_OneUser: (req, res) => {
    //const userId = req.params._id; // Obtener el ID de usuario de los parámetros de la solicitud
    const { userId } = req.user;
    UserDiscountQr.find({ userId: userId }) // Buscar descuentos con el ID de usuario proporcionado
      .then((userDiscountQrs) => {
        res.json(userDiscountQrs); // Enviar los descuentos encontrados como respuesta
      })
      .catch((error) => {
        console.error("Error al buscar descuentos de usuario: ", error);
        res
          .status(500)
          .json({ error: "Error al buscar descuentos de usuario" });
      });
  },
  discountQr_create: (req, res) => {
    const { userId } = req.user;

    const {
      offeredDiscountId,
      discountDescription,
      createdAt,
      expirationDate,
      discountTitle,
      normalPrice,
      priceWithDiscount,
      imageURL,
      businessId,
      businessName,
      userEmail,
    } = req.body;

    // Verificación de los tipos antes de la conversión
    console.log("normalPrice:", typeof normalPrice, normalPrice);
    console.log(
      "priceWithDiscount:",
      typeof priceWithDiscount,
      priceWithDiscount
    );

    const newDiscountQr = new UserDiscountQr({
      discountTitle: discountTitle,
      discountDescription: discountDescription,
      businessId: businessId,
      businessName: businessName,
      userId: userId,
      userEmail: userEmail,
      offeredDiscountId: offeredDiscountId,
      normalPrice: Number(normalPrice), // Convertir a número de manera segura
      priceWithDiscount: Number(priceWithDiscount), // Convertir a número de manera segura
      imageURL: imageURL,
      createdAt: createdAt,
      expirationDate: expirationDate,
    });

    // Guarda los datos del código QR del descuento en la base de datos
    newDiscountQr
      .save()
      .then((UserDiscountQr) => {
        // Enviar respuesta de éxito
        res.json({
          message: "Registro exitoso de los datos del QR del usuario",
          discountQrId: UserDiscountQr._id,
        });
      })
      .catch((error) => {
        console.error("Error al guardar los datos del QR:", error);
        // Manejo de errores
        res
          .status(500)
          .json({
            error: "Error en el registro de los datos del QR del usuario",
          });
      });
  },
  userDiscountQrs_oneDiscount: (req, res) => {
    const userScannerId = req.user.businessId; // ID del negocio del usuario que escanea
    const discountId = req.params._id; // ID del descuento escaneado

    UserDiscountQr.findById(discountId)
      .then((discountFound) => {
        if (!discountFound) {
          // Si no se encontró el descuento, responde con un error 404 y un mensaje descriptivo
          return res.status(404).json({ error: "Descuento no encontrado" });
        }

        if (userScannerId !== discountFound.businessId) {
          return res.status(403).json({ error: "No tienes permiso para validar este descuento." });
        }

        // Si el usuario pertenece al negocio que creó el descuento, lo enviamos
        res.json(discountFound);
      })
      .catch((error) => {
        // Si ocurre un error durante la búsqueda, responde con un error 500 y un mensaje descriptivo
        console.error("Error al buscar el descuento con el id: ", error);
        res
          .status(500)
          .json({ error: "Error interno del servidor." });
      });
  },
  userDiscountQrs_update: (req, res) => {
    //Recupero el id para buscar el descuenteo que quiero actualizar en Base de Datos.
    const discountId = req.params._id;
    console.log("ID del descuento recibido:", discountId);

    //Extraigo los datos que quiero actualizar desde la solicitud patch
    const { isValid, isUsed } = req.body;

    //Creo un objeto con los datos a actualizar en el descuento en Base de Datos.
    const updatedDiscount = {
      isValid,
      isUsed,
    };

    UserDiscountQr.findByIdAndUpdate(discountId, updatedDiscount, { new: true })
      .then((updatedDiscount) => {
        if (!updatedDiscount) {
          // Si no se encontró el descuento, responde con un error 404
          return res.status(404).json({ error: "Descuento no encontrado" });
        }

        console.log(
          "La propiedad isValid del descuento escaneado se ha actualizado correctamente:",
          updatedDiscount
        );
        res.status(200).json(updatedDiscount);
      })
      .catch((error) => {
        console.error(
          "Error al actualizar la propiedad isValid del descuento escaneado:",
          error
        );
        res
          .status(500)
          .json({
            error:
              "Error al actualizar la propiedad isValid del descuento escaneado.",
          });
      });
  },
  consumed_discounts: (req, res) => {
    const { businessId } = req.user;

    UserDiscountQr.find({ businessId: businessId })
      .then((consumedDiscounts) => res.json(consumedDiscounts))
      .catch((error) => {
        console.error("Error al buscar descuentos utilizados: ", error);
        res
          .status(500)
          .json({ error: "Error al buscar descuentos utilizados" });
      });
  },
};

export default controller;
