
import Empanada from './empanada.model';

export async function getEmpanada(req,res) {
  // const { name } = req.query;

  const empanadas = await Empanada.find(req.query);

  res.status(200).json(empanadas);
}

export async function createEmpanada(req, res) {
  try {
    const { name } = req.body;
    const empanada = new Empanada({ name });
    const resultado = await empanada.save();
    res.status(200).json(resultado);
  } catch (err) {
    res.status(500).json(err);
  }
}

export async function patchEmpanada(req, res) {
  res.status(200).json({});
}

export async function deleteEmpanada(req, res) {
  res.status(200).json({});
}