
function creaRagId(id){
const Id_chroma = `paz_${String(id).padStart(3, '0')}`;
return Id_chroma
} 

module.exports = {
    creaRagId //che richiamo nel controller 
}

