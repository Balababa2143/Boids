open System

let psi = 2.0/(1.0+Math.Sqrt(5.0))
let gen ratio ``a+b`` =
    let a = ratio * ``a+b``
    let b = ``a+b``-a
    Some (a, b)
let level = 4
let makeSeq ratio max rounding =
    Seq.unfold (gen ratio) max
    |> Seq.take level
    |> Seq.mapFold (fun acc (x: float) -> 
            let sum = Math.Round(acc+x, rounding, MidpointRounding.ToEven)
            (sum, sum)
        ) 0.0
    |> fst

printfn "Light Alpha:"
let alpha = makeSeq psi 255.0 0
alpha
|>Seq.iter (printfn "%f")
printfn ""

printfn "Dark Alpha:"
let alpha' = makeSeq 0.45 250.0 0

alpha'
|>Seq.iter (printfn "%f")