(module
  ;; Le importazioni devono avvenire all'inizio del modulo
 (import "env" "sharedArray" (global (mut i32)))
 (memory (export "memory") 1) ;; 1 pagina di memoria (64KB)
  (func (export "incrementArray") (param $start i32) (param $end i32)
    (local $i i32)
    (local $byte_offset i32) ;; Dichiarazione della variabile locale $byte_offset

    (local.set $i (local.get $start)) ;; Inizializza l'indice

    (block $end_loop ;; Definisci un blocco con l'etichetta $end_loop
      (loop $loop
        (br_if $end_loop (i32.ge_u (local.get $i) (local.get $end)))

        ;; Calcola l'offset nella memoria condivisa
        (local.get $i)
        (i32.mul (local.tee $byte_offset) (i32.const 4)) ;; Ogni intero a 32 bit occupa 4 byte

        ;; Incrementa l'elemento utilizzando i32.atomic.rmw.add
        (i32.const 0)           ;; alignment
        (i32.const 0)           ;; base address (implicito come 0 per la memoria importata)
        (local.get $byte_offset)
        (i32.add)               ;; indirizzo effettivo
        (i32.const 1)           ;; valore da aggiungere
        (i32.atomic.rmw.add)    ;; esegue l'addizione atomica
        (drop)                  ;; scarta il valore precedente

        (local.get $i)
        (i32.const 1)
        (i32.add)
        (local.set $i)
        (br $loop)
      )
    )
  )
)