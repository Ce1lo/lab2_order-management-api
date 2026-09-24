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
        res.json({
            success: true,
            data: orders,
            message: 'Lay danh sach don hang thanh cong'
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
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
        res.json({
            success: true,
            data: orders,
            message: 'Tim kiem don hang thanh cong'
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
});

// 3. Lay don hang theo ID (GET /api/orders/:id)
router.get('/:id', async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Khong tim thay don hang'
            });
        }
        res.json({
            success: true,
            data: order,
            message: 'Lay chi tiet don hang thanh cong'
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
});

// 4. Tao don hang moi (POST /api/orders)
router.post('/', async (req, res) => {
    try {
        const { customerName, customerEmail, items, totalAmount } = req.body;

        // Validation nang cao: Kiem tra danh sach items hop le
        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Don hang phai co it nhat mot san pham (items)'
            });
        }

        // Tinh tong tien thuc te tu quantity * unitPrice cua tat ca items
        const calculatedTotal = items.reduce((sum, item) => {
            const quantity = Number(item.quantity) || 0;
            const unitPrice = Number(item.unitPrice) || 0;
            return sum + (quantity * unitPrice);
        }, 0);

        // Kiem tra xem totalAmount gui len co khop voi tong tinh duoc khong
        if (Number(totalAmount) !== calculatedTotal) {
            return res.status(400).json({
                success: false,
                message: `totalAmount khong hop le! Tong tinh duoc la ${calculatedTotal}, nhung nhan duoc la ${totalAmount}`
            });
        }

        const order = new Order({
            customerName,
            customerEmail,
            items,
            totalAmount
        });

        const newOrder = await order.save();
        res.status(201).json({
            success: true,
            data: newOrder,
            message: 'Tao don hang thanh cong!'
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message
        });
    }
});

// 5. Cap nhat don hang (PUT /api/orders/:id)
router.put('/:id', async (req, res) => {
    try {
        // Neu yeu cau co cap nhat items va/hoac totalAmount, kiem tra tinh nhat quan
        if (req.body.items && req.body.totalAmount !== undefined) {
            const calculatedTotal = req.body.items.reduce((sum, item) => {
                const quantity = Number(item.quantity) || 0;
                const unitPrice = Number(item.unitPrice) || 0;
                return sum + (quantity * unitPrice);
            }, 0);

            if (Number(req.body.totalAmount) !== calculatedTotal) {
                return res.status(400).json({
                    success: false,
                    message: `totalAmount khong hop le! Tong tinh duoc la ${calculatedTotal}, nhung nhan duoc la ${req.body.totalAmount}`
                });
            }
        }

        const updateOrder = await Order.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!updateOrder) {
            return res.status(404).json({
                success: false,
                message: 'Khong tim thay don hang'
            });
        }

        res.json({
            success: true,
            data: updateOrder,
            message: 'Cap nhat don hang thanh cong!'
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message
        });
    }
});

// 6. Xoa don hang (DELETE /api/orders/:id)
router.delete('/:id', async (req, res) => {     
    try {         
        const deleted = await Order.findByIdAndDelete(req.params.id);         
        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: 'Khong tim thay don hang'
            });
        }

        res.json({
            success: true,
            data: deleted,
            message: 'Da xoa don hang thanh cong!'
        });     
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
}); 
module.exports = router;