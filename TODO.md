# Production Se Pehle Yeh Fix Karna Hai

- [ ] Purchase.reference ko required banao (abhi optional hai testing ke liye)
- [ ] Saara test/dummy data clean karo database se
# Production Se Pehle Yeh Fix Karna Hai

- [ ] Purchase.reference ko required banao (abhi optional hai testing ke liye)
- [ ] Saara test/dummy data clean karo database se
- [ ] Expense.warehouseId ko required banao (abhi optional hai kyunki purane test records mein warehouse nahi tha)
- [ ] Sale.reference, PurchaseReturn.reference, SaleReturn.reference sab optional hain testing ki wajah se — production mein required banane pe socho
TODO.md mein ek line daal do: agar do log ek hi pending transfer ko ek saath "Mark Completed" karein toh stock do baar move ho sakta hai. Learning project mein theek hai, production se pehle updateMany guard lagana hoga.
e do cheezein abhi sirf label ke liye hain, aur ek hi sach nahi hain:

Promotional price: billing/POS abhi bhi product.price hi use karti hai. Jab tak wo fix na ho, kisi product par promo price tabhi daalein jab aap bill par bhi wahi price lagane wale hon, warna label aur bill alag honge.
Batch no.: Product par sirf ek hi batch ka number rahega. Ek product ki kai khep hongi to ye kam padega, aur tab hum purchase ke saath batch aur expiry ka alag kaam karenge.