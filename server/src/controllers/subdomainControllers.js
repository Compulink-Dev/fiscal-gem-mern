export const createSubdomain = async (req, res) => {
  try {
    const { subdomain, taxpayer } = req.body;

    // Validate input
    if (!subdomain || !taxpayer) {
      return res.status(400).json({
        success: false,
        message: "Subdomain and taxpayer are required",
      });
    }

    // Check if taxpayer exists
    const taxpayerExists = await Taxpayer.findById(taxpayer);
    if (!taxpayerExists) {
      return res.status(404).json({
        success: false,
        message: "Taxpayer not found",
      });
    }

    // Create new subdomain
    const newSubdomain = new Subdomain({
      subdomain,
      taxpayer,
    });

    await newSubdomain.save();

    res.status(201).json({
      success: true,
      data: newSubdomain,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Subdomain already exists",
      });
    }
    res.status(500).json({
      success: false,
      message: err.message || "Server error",
    });
  }
};

export const getSubdomain = async (req, res) => {
  try {
    const subdomains = await Subdomain.find({
      taxpayer: req.params.taxpayerId,
    });
    res.json({
      success: true,
      data: subdomains,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || "Server error",
    });
  }
};

export const getSubdomainById = async (req, res) => {
  try {
    const subdomain = await Subdomain.findById(req.params.id);
    if (!subdomain) {
      return res.status(404).json({
        success: false,
        message: "Subdomain not found",
      });
    }
    res.json({
      success: true,
      data: subdomain,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || "Server error",
    });
  }
};

export const updateSubdomain = async (req, res) => {
  try {
    const { subdomain } = req.body;

    const updatedSubdomain = await Subdomain.findByIdAndUpdate(
      req.params.id,
      { subdomain },
      { new: true, runValidators: true }
    );

    if (!updatedSubdomain) {
      return res.status(404).json({
        success: false,
        message: "Subdomain not found",
      });
    }

    res.json({
      success: true,
      data: updatedSubdomain,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Subdomain already exists",
      });
    }
    res.status(500).json({
      success: false,
      message: err.message || "Server error",
    });
  }
};

export const deleteSubdomain = async (req, res) => {
  try {
    const deletedSubdomain = await Subdomain.findByIdAndDelete(req.params.id);
    if (!deletedSubdomain) {
      return res.status(404).json({
        success: false,
        message: "Subdomain not found",
      });
    }
    res.json({
      success: true,
      message: "Subdomain deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || "Server error",
    });
  }
};
