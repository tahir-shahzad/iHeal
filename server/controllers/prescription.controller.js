const PrescriptionSchema = require("../models").prescription;
const newPrescriptionSchema = require("../models").newPrescription;
const PrescriptionMedicineSchema = require("../models").prescriptionMedicine;
const PrescriptionImageSchema = require("../models").prescriptionImage;
const PrescriptionComplaintSchema = require("../models").prescriptionComplaint;
const PatientSchema = require('../models').patient;
const updatedPrescriptionComplaintSchema = require("../models").prescriptionComplaint;
const labSets = require("../models").labSets;
var config_db = require(__dirname + "/../config/config.json")[env];
var Sequelize = require("sequelize");
var env = process.env.NODE_ENV || "development";
var config_db = require(__dirname + "/../config/config.json")[env];
var sequelize = new Sequelize(
  config_db.database,
  config_db.username,
  config_db.password,
  config_db
);
const fs = require("fs");
const uuidv4 = require("uuid/v4");
const path = require("path");

PrescriptionSchema.hasMany(PrescriptionImageSchema, {
  foreignKey: "id"
});
PrescriptionSchema.hasMany(PrescriptionComplaintSchema, {
  foreignKey: "id"
});
PrescriptionSchema.hasMany(PrescriptionMedicineSchema, {
  foreignKey: "id"
});
PrescriptionSchema.hasMany(PatientSchema, {
  foreignKey: "id",
  sourceKey: 'patientId'
});


/* Create Prescriptions if Session user is
** SuperAdmin Admin or Doctor.
*/
exports.create = (req, res) => {
  if (
    req.session.userId &&
    (req.session.userType == "superAdmin" ||
      req.session.userType == "Admin" ||
      req.session.userType == "Doctor")
  ) {
    //do nothing
  } else {
    return res.status(200).send({
      success: false,
      message: "You dont have access to create prescription"
    });
  }
  let prescriptionId;
  /*---------------------------------*/
  /*---Prescription is adding Complaints and images with details
  /*-- and NewPrescription is adding labset and Medicines
  /*---------------------------------
  /*---------------------------------*/
  PrescriptionSchema.create(req.body)
    .then(data => {
      prescriptionId = data.id;
    })
    .then(() => {
      // uploading images.
      insertImages(req, prescriptionId, res);
    })
    .then(() => {
      // inserting complaints.
      insertComplaints(req, prescriptionId, res);
    // })
    // .then(() => {
      // inserting Medicine for prescription
      // insertMedicines(req, prescriptionId, res);
    })
    .then(() => {
      return res.status(200).send({
        success: true,
        message: "Records inserted successfully"
      });
    })
    .catch(err => {
      return res.status(200).send({
        success: false,
        message: err.message
      });
    });
};

// Creating new prescription.
exports.newPrescriptionCreate = (req, res) => {
  if (
    req.session.userId &&
    (req.session.userType == "superAdmin" ||
      req.session.userType == "Admin" ||
      req.session.userType == "Doctor" ||
      req.session.userType == "Assistant")
  ) {
    //do nothing
  } else {
    return res.status(200).send({
      success: false,
      message: "You dont have access to create prescription"
    });
  }
  let prescriptionId;
  newPrescriptionSchema.create(req.body)
    .then(data => {
      // console.log('data after create');
      // console.log(data);
      if (data) {
        newPrescriptionId = data.id;
        insertImages(req, prescriptionId, res);
        insertComplaints(req, newPrescriptionId, res);
        // Insert Medicines        
        insertMedicines(req, newPrescriptionId, res);
      }
      if (req.body.labset.length > 0) {
        insertLabSet(req, res, newPrescriptionId);
      }
    })
    .then(data => {
      //console.log(data);

      return res.status(200).send({
        success: true,
        message: "Records inserted successfully"
      });
    })
    .catch(err => {
      return res.status(200).send({
        success: false,
        message: err.message
      });
    });
};

// Find all Prescriptions
exports.findAll = (req, res) => {
  PrescriptionSchema.findAll({
    include: [
      PrescriptionImageSchema,
      PrescriptionComplaintSchema,
      PrescriptionMedicineSchema
    ]
  })
    .then(data => {
      if (!data.length) {
        return res.status(200).send({
          success: false,
          message: "prescription not found"
        });
      } else {
        return res.status(200).send({
          success: true,
          total_records: data.length,
          data: data
        });
      }
    })
    .catch(err => {
      return res.status(200).send({
        success: false,
        message: err.message
      });
    });
};

// Get Prescriptions by Patient Id.
exports.findByPatient = (req, res) => {
  let allData = {};
  PrescriptionSchema.findAll({
    where: {
      patientId: req.params.id
    }
    // include: [PrescriptionImageSchema, PrescriptionComplaintSchema, PrescriptionMedicineSchema]
  })
    .then(data => {
      if (!data.length) {
        return res.status(200).send({
          success: false,
          message: "prescription not found"
        });
      } else {
        let itemsProcessed = 0;
        let alldata = [];
        function callBack(res, alldata) {
          return res.status(200).send({
            success: true,
            total_records: alldata.length,
            data: alldata
          });
        }
        data.forEach(element => {
          // Get Complaints Details.
          getDetails(element.id, function (error, patientDetails) {
            alldata[itemsProcessed] = {};
            alldata[itemsProcessed].patientdata = {};
            alldata[itemsProcessed].patientdata = data[itemsProcessed];
            alldata[itemsProcessed].patientdata.patientDetails = patientDetails;
            itemsProcessed++;
            if (itemsProcessed === data.length) {
              return callBack(res, alldata);
            }
          });
        });
      }
    })
    .catch(err => {
      return res.status(200).send({
        success: false,
        message: err.message
      });
    });
};
// remove acall back hell
function getDetails(prescriptionId, callback) {
  let thisPatientDetails = {};
  PrescriptionComplaintSchema.findAll({
    where: {
      prescriptionId: prescriptionId
    }
  }).then(PrescriptionComplaints => {
    thisPatientDetails.PrescriptionComplaints = PrescriptionComplaints;
    //================================================//
    PrescriptionImageSchema.findAll({
      where: {
        prescriptionId: prescriptionId
      }
    }).then(PrescriptionImage => {
      thisPatientDetails.PrescriptionImage = PrescriptionImage;
      //============================================================//
      PrescriptionMedicineSchema.findAll({
        where: {
          prescriptionId: prescriptionId
        }
      }).then(PrescriptionMedicine => {
        thisPatientDetails.PrescriptionMedicine = PrescriptionMedicine;
        callback(null, thisPatientDetails);
      });
    });
  });
}
var Sequelize = require("sequelize");
exports.presComplaints = (req, res) => {
  sequelize
    .query(
      'select "createdAt"  from "prescriptionComplaints" where "patientId" = ' + req.params.id + '  GROUP BY date("createdAt");',
      {
        model: updatedPrescriptionComplaintSchema
      }
    )
    .then(data => {
      console.log(data);

      if (!data) {
        return res.status(200).send({
          success: false,
          message: "no record found"
        });
      } else {
        return res.status(200).send({
          success: true,
          total_records: data.length,
          data: data
        });
      }
    })
    .catch(err => {
      return res.status(200).send({
        success: false,
        message: err.message
      });
    });
};

exports.presMedicines = (req, res) => { };
// insert images.
function insertImages(req, prescriptionId, res) {
  if (req.body.image instanceof Array && req.body.image.length !== 0) {
    req.body.image.forEach(element => {
      element.prescriptionId = prescriptionId;
      if(element.image_base64)
      {
        base64Converter(element.image_base64, (err, res) => {
          element.imagePath = res;
          PrescriptionImageSchema.create(element).then(image => {
            console.log("________ IMAGE __________");
          });
        });
      }
    });
  } else {
    return res.status(200).send({
      success: false,
      message: "Array with name image is required"
    });
  }
}

// Inserting Complaints.
function insertComplaints(req, prescriptionId, res) {
  if (req.body.complaint instanceof Array && req.body.complaint.length !== 0) {
    console.log("inside complaint...");
    req.body.complaint.forEach(element => {
      if(element.complaints)
      {
        element.prescriptionId = prescriptionId;
        element.patientId = req.body.patientId;
        element.clinicId = req.body.clinicId;
        element.userId = req.body.userId;
        PrescriptionComplaintSchema.create(element).then(complaint => {
          console.log("_________ COMPAINT _________");
        });
      }
    });
  } else {
    return res.status(200).send({
      success: false,
      message: "Array with name complaint is required"
    });
  }
}

// Inserting Medicines
function insertMedicines(req, prescriptionId, res) {
  if ( req.body.medicine instanceof Array && req.body.medicine.length !== 0 && req.body.medicine[0] && req.body.medicine[0].medicine ) {
    req.body.medicine[0].medicine.forEach(element => {
      console.log("medicine element");
      console.log(element);
      element.prescriptionId = prescriptionId;
      PrescriptionMedicineSchema.create({
        prescriptionId: element.prescriptionId,
        userId: req.body.userId,
        patientId: req.body.patientId,
        clinicId: req.body.medicine[0].clinicId,
        medicineName: element.medicine,
        frequency: element.frequency,
        duration: element.duration,
        quantity: element.quantity,
        route:element.route
      }).then(medicine => {
      });
    });
  } else {
    return res.status(200).send({
      success: false,
      message: "Array with name medicine is required"
    });
  }
}

function insertLabSet(req, res, prescriptionId) {
  console.log('inside labset function');
  console.log(req.body.labset);
  if (req.body.labset instanceof Array && req.body.labset.length !== 0) {
    req.body.labset.forEach(element => {
      element.prescriptionId = prescriptionId;
      labSets.create({
        prescriptionId: element.prescriptionId,
        diagnosis: element.diagnosis,
        additionalNotes: element.additionalNote,
        labSet: element.labSet

      }).then(data => {
        console.log('Record OF LabSet Is Added.');

      });
    });
  } else {
    return res.status(200).send({
      success: false,
      message: "Array with name medicine is required"
    });
  }
}


function base64Converter(base64ImgStr, callback) {
  let destDir = path.join(__dirname, "../../");
  let dbPath = 'assets/prescription_img/' + uuidv4() + '.' + ".jpg";
  let imgPath = destDir + dbPath;
  fs.writeFile(imgPath, base64ImgStr, "base64", err => {
    if (err) {
      console.log(err);
    } else {
      callback(err, dbPath);
    }
  });
}
//  get prescription complaint latest record 

exports.getlatestPrescriptionComplaint = (req, res) => {
  let id = req.params.id;
  //let requestDate = new Date(req.body.requestDate);
  console.log(id);
  // console.log(requestDate);

  sequelize
    .query(
      'SELECT *  FROM "prescriptionComplaints" AS "prescriptionComplaint" WHERE "prescriptionComplaint"."prescriptionId" = (select id from prescriptions where "patientId" = ' + id + '  order by id desc limit 1) ;',
      {
        model: updatedPrescriptionComplaintSchema
      }
    ).then(data => {
      if (data) {
        res.send({
          success: true,
          data: data
        })
      }
    })
}

// Get Prescription History by Patient Id.
exports.getPrescriptionHistory = (req, res) => {
  let myDate = new Date(req.body.createdAt);
  newPrescriptionSchema.findAll({
    where: {
      $and: [
        {
          patientId: req.body.patientId,
        },
        {
          createdAt: myDate
        }
      ]
    }
  }).then(data => {
    if (data.length <= 0) {
      res.send({
        success: false,
        message: "No Prescription  Found"
      })
    }
    else {
      let count = 0;
      let alldata = [];
      function Result(res, alldata) {
        return res.status(200).send({
          success: true,
          total_records: alldata.length,
          data: alldata
        });
      }
      data.forEach(element => {
        // Get Medicines Details for prescriptions.
        getMedicineDetail(element.id, function (error, patientDetails, labset) {
          //    console.log('..................',labset,'..................');
          alldata[count] = {};
          alldata[count].prescriptionData = {};
          alldata[count].prescriptionData = data[count];
          alldata[count].prescriptionData.patientDetails = patientDetails;
          alldata[count].prescriptionData.labSetDetails = labset;
          count++;
          if (count === data.length) {
            return Result(res, alldata);
          }
        });

      });
    }

  }).catch(err => {
    return res.status(200).send({
      success: false,
      message: err.message
    });
  });
}


// Get Prescription Images History.
exports.getPrescriptionImagesHistory = (req, res) => {
  let myDate = new Date(req.body.createdAt)
  PrescriptionImageSchema.findAll({
    where: {
      $and: [
        {
          patientId: req.body.patientId,
        },
        {
          createdAt: myDate
        }
      ]
    }
  }).then(data => {
    if (data.length <= 0) {
      res.send({
        success: false,
        message: "No Prescription Images Found"
      })
    }
    else {
      res.send({
        success: true,
        data: data
      })
    }

  }).catch(err => {
    return res.status(200).send({
      success: false,
      message: err.message
    });
  });
}

// Get Prescription Complaints history.
exports.getPrescriptionComplaintHistory = (req, res) => {
  let myDate = new Date(req.body.createdAt)
  updatedPrescriptionComplaintSchema.findAll({
    where: {
      $and: [
        {
          patientId: req.body.patientId,
        },
        {
          createdAt: myDate
        }
      ]
    }
  })
    .then(data => {
      if (data.length <= 0) {
        res.send({
          success: false,
          message: "No Prescription Images Found"
        })
      }
      else {
        res.send({
          success: true,
          data: data
        })
      }
    })
}

// Get Medicine Details for Prescriptions.
function getMedicineDetail(id, callBack) {
  let prescriptonData = {};
  let labset = {}
  PrescriptionMedicineSchema.findAll({
    where: {
      prescriptionId: id
    }
  }).then(data => {
    prescriptonData.MedicineDetail = data
    // Get Labset Record.
    labSets.findAll({
      where: {
        prescriptionId: id
      }
    }).then(labset => {
      callBack(null, prescriptonData, labset)
    })
  })
}



exports.showDoctorActivityLog = (req, res) => {
  console.log(req.body);
  var mydate = new Date(req.body.mydate);
  PrescriptionSchema.findAll({
    where: {
      $and: [
        { doctorId: req.body.doctorid },
        { createdAt: mydate }
      ]
    },
    include: [PatientSchema]
  })
    .then(data => {
      res.send({
        success: true,
        data: data
      })
    })
    .catch(err => {
      res.send({
        success: false,
        messasge: err.message
      })
    })
}

