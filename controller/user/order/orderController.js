const Order = require("../../../model/orderSchema");

//create Order!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
exports.createOrder = async (req, res) => {
  const userId = req.user.userId;
  console.log(req.body);
  //   return
  const { shoppingAddress, items, totalAmount, paymentDetails } = req.body;
  if (!shoppingAddress || !items || !totalAmount || !paymentDetails) {
    return res.status(400).json({
      message:
        "Please provide shoppingAddress,items,totalAmount,paymentDetails",
    });
  }
  await Order.create({
    user: userId,
    shoppingAddress,
    items,
    totalAmount,
    paymentDetails,
  });
  res.status(200).json({
    message: "Order created successfully",
  });
};
//get My order only!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
exports.getMyOrders = async (req, res) => {
  const userId = req.user.userId;
  const orders = await Order.find({ user: userId }).populate({
    path: "items.product",
    model: "Product",
    select:
      "-productStockQty -createdAt -updatedAt -reviews -__v -paymentDetails ",
  });
  if (orders.length == 0) {
    return res.status(404).json({
      message: "No orders found",
      data: [],
    });
  }
  res.status(200).json({
    message: "Orders Fetched Successfully",
    data: orders,
  });
};
//update order!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
exports.updateMyOrder = async (req, res) => {
    const userId=req.user.id
  const { id } = req.params;//order id
  const { shoppingAddress, items } = req.body;
  if(!shoppingAddress||!items){
    return res.status(400).json({
        message:"Please provide shoppingAddress,items"
    })
  }
  //get order of abode id
  const existingOrder = await Order.findById(id);
  if (!existingOrder) {
    return res.status(404).json({
      message: "No order with that id",
    });
  }
  //check if the trying to update user is true ordered User
  if(existingOrder.user!==userId){
    return res.status(403).json({
        message:"You don't have permission to update this order "
    })
  }
  if (existingOrder.orderStatus == "Ontheway") {
    return res.status(400).json({
      message: "You cannot update order when it is on the way",
    });
  }
  const updatedOrder=await Order.findByIdAndUpdate(id,{shoppingAddress,items},{new:true});
  res.status(200).json({
    message:"Order upsated Successfully",
    data:updatedOrder
  })
};
//delete order!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
exports.deleteMyOrder=async(req,res)=>{
    const {userId}=req.user.id
    const {id}=req.params

    //check if order exists or not
    const order=await Order.findById(id)
    if(!order){
        return res.status(400).json({
            message:"No order with that id"
        })
    }
    if(order.user!==userId){
        return res.status(400).json({
            message:"You don't have permission to delete this order"
        })
    }
    await Order.findByIdAndDelete(id)
    res.json(200).json({
        message:"Order deleted Successfully",
        data:null
    })
}//cancel order!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
exports.cancelOrder=async(req,res)=>{
    const {id}=req.body
    const userId=req.user.id    
    const {status}=req.body
    //check if order exists or not
    const order=await Order.findById(id)
    if(!order){
        return res.status(400).json({
            message:"No order with that id"
        })
    }
    if(order.user!==userId){
        return res.status(400).json({
            message:"You don't have permission to cancelled this order"
        })
    }
    if(order.status!=="pending"){
        return res.status(400).json({
            message:"You can't cancel this order it is not Pending"
        })
    }
    await Order.findByIdAndUpdate(id,{
        orderStatus:"cancelled"
    })
    res.status(200).json({
        message:"Order cancelled Successfully"
    })
}
