const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

// 1. Lay toan bo don hang (ho tro Loc theo status & Sap xep theo totalAmount)
// GET /api/orders
// GET /api/orders?status=pending (Yeu cau 1)
// GET /api/orders?sort=asc hoac sort=desc (Yeu cau 3)
router.get('/', async (req, res) => {
    try {
        const { status, sort } = req.query;

        // Xay dung query loc
        const filter = {};
        if (status) {
            filter.status = status;
        }

        // Xay dung tuy chon sap xep
        let sortOption = { createAt: -1 }; // Mac dinh sap xep theo thoi gian tao moi nhat
        if (sort === 'asc') {
            sortOption = { totalAmount: 1 };
        } else if (sort === 'desc') {
            sortOption = { totalAmount: -1 };
        }

        const orders = await Order.find(filter).sort(sortOption);
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 2. Tim kiem theo ten khach hang (Yeu cau 2: GET /api/orders/search?name=...)
// LUU Y: Phai dat router nay TRUOC router.get('/:id') de tranh Express hieu nham 'search' la mot ':id'
router.get('/search', async (req, res) => {
    try {
        const { name } = req.query;
        const query = name 
            ? { customerName: { $regex: name, $options: 'i' } }
            : {};

        const orders = await Order.find(query).sort({ createAt: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 3. Lay don hang theo ID (GET /api/orders/:id)
router.get('/:id', async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Khong tim thay don hang' });
        res.json(order);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/', async (req, res) => {
    const order = new Order({
        customerName:   req.body.customerName,
        customerEmail:  req.body.customerEmail,
        items:          req.body.items,
        totalAmount:    req.body.totalAmount
    });
    try {
        const newOrder = await order.save();
        res.status(201).json(newOrder);
    } catch (err){
        res.status(400).json({ message: err.message });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const updateOrder = await Order.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if(!updateOrder) return res.status(404).json({ message: 'Khong tim thay don hang'});
        res.json(updateOrder);
    }catch (err) {
        res.status(400).json({ message: err.message});
    }
})

// 5. Xoa don hang (DELETE /api/orders/:id) 
router.delete('/:id', async (req, res) => {     
    try {         
        const deleted = await Order.findByIdAndDelete(req.params.id);         
        if (!deleted) return res.status(404).json({ message: 'Khong tim thay don hang' });         
        res.json({ message: 'Da xoa don hang thanh cong!' });     
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}); 
module.exports = router;