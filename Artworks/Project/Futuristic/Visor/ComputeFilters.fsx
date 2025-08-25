open System

let psi = 2.0/(1.0+Math.Sqrt(5.0))
let gen ratio ``a+b`` =
    let a = ratio * ``a+b``
    Some (``a+b``, a)

let makeSeq ratio max =
    Seq.unfold (gen ratio) max
    |> Seq.map (fun x -> Math.Round(x, digits=0, mode=MidpointRounding.ToEven))

printfn "Light Alpha:"
let alpha = 
    makeSeq psi 245.0
    |> Seq.take 4

alpha
|>Seq.iter (printfn "%.0g")
printfn ""

printfn "Dark Alpha:"
let alpha' = 
    makeSeq psi  230.0
    |> Seq.take 4

alpha'
|>Seq.iter (printfn "%.0g")