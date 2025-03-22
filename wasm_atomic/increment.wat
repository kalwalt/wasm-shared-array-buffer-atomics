(module
  ;; Import the shared array offset
  (import "env" "sharedArray" (global $sharedArrayOffset (mut i32)))
  ;; Import the memory
  (import "env" "memory" (memory 1 1024 shared))
  ;; Import the print function
  (import "env" "print_i32" (func $print_i32 (param i32)))

  (func (export "incrementArray") (param $start i32) (param $end i32)
    (local $i i32)
    (local $byte_offset i32)
    (local $effective_address i32)
    
    ;; Debugging: Print the global offset and parameters
    (global.get $sharedArrayOffset)
    (call $print_i32)
    (local.get $start)
    (call $print_i32)
    (local.get $end)
    (call $print_i32)

    (local.set $i (local.get $start))

    (block $end_loop
      (loop $loop
        (br_if $end_loop (i32.ge_u (local.get $i) (local.get $end)))

        ;; Calcola l'offset nella memoria condivisa
        (local.get $i)
        (i32.mul (local.tee $byte_offset) (i32.const 4))

        ;; Calculate the effective address
        (global.get $sharedArrayOffset)
        (local.get $byte_offset)
        (i32.add)
        (local.set $effective_address)

        ;; Incrementa l'elemento utilizzando i32.atomic.rmw.add
        (i32.const 0)           ;; alignment
        (local.get $effective_address)       ;; effective address
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
