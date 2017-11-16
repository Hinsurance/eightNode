$(function() {
	//点击确定按钮
	$('#submit-btn').on('click',function() {
		//清空右边结果
		$('.right-box').html('');
		var start_end_node = {},
			start_node = {},//初始节点
			end_node = {},//目标节点
			cur_node = {},//当前节点
			open_list = [],//open表
			close_list = [],//close表
			result = [];//存放最佳搜索路径的数组

		//获取初始节点、目标节点
		start_end_node = getNode();
		start_node = start_end_node.start_node;
		end_node = start_end_node.end_node;

		//更正初始节点的启发值 评估值
		h(start_node,end_node);
		f(start_node);
		
		//第一次扩展初始节点
		open_list.push(start_node);//初始节点写进open表
		expandNode(start_node,end_node,open_list,close_list);//扩展初始节点
		sortOpenList(open_list);//重排open表

		//判断是否到达目标节点
		//是则输出
		//否则继续扩展节点
		ifReachEnd(start_node,end_node,open_list,close_list,result);
		
		//输出最佳路径
		for (var i = result.length - 1; i >= 0; i--) {
			//将节点中的'0'去掉
			for (var j = result[i].values.length - 1; j >= 0; j--) {
				if (result[i].values[j] == 0) {
					result[i].values[j] = '';
				}
			}
			printNode(result[i]);
		}
	})
})


/**
 * 获取初始节点、目标节点
 * @return {object} 返回包含初始节点对象、目标节点对象的对象
 */
function getNode() {
	var start_node = [],
		end_node = [];

	for (var i = 0;i < 9;i++) {
		start_node.push(parseInt($('#s'+i).val()));
		end_node.push(parseInt($('#e'+i).val()));
	}

	//空格位置用'0'表示
	for (var j = 0;j < 9;j++) {
		if (!start_node[j]) {
			start_node[j] = 0;
		}
		if (!end_node[j]) {
			end_node[j] = 0;
		}
	}
	
	return {
		start_node: {
			values: start_node,
			parent: null,
			g: 0,
			h: -1,
			f: -1
		},
		end_node: {
			values: end_node,
			parent: {},
			g: -1,
			h: 0,
			f: -1
		}
	}
}

/**
 * 寻找当前节点空格位置的函数
 * @param  {object} node 当前节点
 * @return {number}      当前节点空格位置
 */
function fineZeroIndex(node) {
	var zero_index = -1;
	for (var i = 0;i < 9;i++) {
		if (node.values[i] == 0) {
			zero_index = i;
		}
	}
	return zero_index;
}

/**
 * 计算耗散值函数
 * @param  {object} cur 当前节点
 * @param  {object} par 父节点
 * @return {number}     耗散值
 */
function g(cur,par) {
	cur.g = par.g + 1;
}

/**
 * 启发函数
 * 错子个数
 * @param  {object} cur 当前节点
 * @param  {object} end 目标节点
 * @return {number}     启发值
 */
function h(cur,end) {
	var differ = 0;
	for (var i = 0;i < 9;i++) {
		if (cur.values[i] != end.values[i]) {
			differ++;
		}
	}
	//错子个数不包含空格
	var cur_index = fineZeroIndex(cur),
		end_index = fineZeroIndex(end);
	if (cur_index != end_index) {
		differ = differ - 1;
	}
	cur.h = differ;
}

/**
 * 估价函数
 * @param  {object} cur 当前节点
 * @return {number}     评估值
 */
function f(cur) {
	cur.f = cur.g + cur.h;
}

/**
 * 创建节点
 * 并计算出g h f
 * @param  {object} par            父节点
 * @param  {object} end            目标节点
 * @param  {number} zero_index     父节点空格位置
 * @param  {number} exchange_index 与空格交换的值的位置
 * @param  {array}  open_list      open表
 * @return {object}                生成的子节点
 */
function childNode(par,end,zero_index,exchange_index,open_list) {
	var node = cloneObjectFn(par);//若直接赋值 会影响原先对象的值
	node.parent = par;
	node.values[zero_index] = node.values[exchange_index];
	node.values[exchange_index] = 0;
	
	//若生成子节点与祖父节点相同 则不生成
	if (par.parent) {
		var differ = 0;
		for (var i = 0;i < 9;i++) {
			if (node.values[i] != par.parent.values[i]) {
				differ++;
			}
		}
		if (!differ) {
			return false;
		}
	}
	
	//更新子节点的耗散值 启发值 评估值
	g(node,par);
	h(node,end);
	f(node);
	
	//将新节点写入open表
	open_list.splice(0,0,node);
}

/**
 * 对象深度克隆
 * @param  {[type]} obj [description]
 * @return {[type]}     [description]
 */
function cloneObjectFn (obj){ // 对象复制
    return JSON.parse(JSON.stringify(obj));
}

/**
 * 重排open表
 * 评估值最小排最前
 * @param  {array} open_list  [description]
 * @return {[type]}           [description]
 */
function sortOpenList(open_list) {
	var length = open_list.length,
		temp = -1;
	
	for (var i = length - 1; i >= 0; i--) {
		for (var j = 0;j < i;j++) {
			if (open_list[j].f > open_list[j+1].f) {
				temp = open_list[j+1];
				open_list[j+1] = open_list[j];
				open_list[j] = temp;
			}
		}
	}
}

/**
 * 从open表中删除已扩展节点
 * @param  {array} open_list  open表
 * @param  {object} cur_node  当前要删除的节点
 * @return {[type]}           [description]
 */
function deleteOpenNode(open_list,cur_node) {
	var length = open_list.length;
	for (var i = 0;i < length;i++) {
		//删除已扩展节点
		if (open_list[i] === cur_node) {
			open_list.splice(i,1);
		}
	}
}

/**
 * 扩展当前节点
 * 更新open表 close表
 * @param  {object} cur_node   当前节点
 * @param  {object} end_node   目标节点
 * @param  {array} open_list   open表
 * @param  {array} close_list  close表
 * @return {[type]}            [description]
 */
function expandNode(cur_node,end_node,open_list,close_list) {
	var zero_index = fineZeroIndex(cur_node);
	
	//扩展当前节点
	if (zero_index == 0) {
		childNode(cur_node,end_node,zero_index,1,open_list);
		childNode(cur_node,end_node,zero_index,3,open_list);
		deleteOpenNode(open_list,cur_node);//从open表中删除已扩展节点
		close_list.push(cur_node);//已扩展的父节点写入close表	
	} else if (zero_index == 1) {
		childNode(cur_node,end_node,zero_index,0,open_list);
		childNode(cur_node,end_node,zero_index,2,open_list);
		childNode(cur_node,end_node,zero_index,4,open_list);
		deleteOpenNode(open_list,cur_node);
		close_list.push(cur_node);
	} else if (zero_index == 2) {
		childNode(cur_node,end_node,zero_index,1,open_list);
		childNode(cur_node,end_node,zero_index,5,open_list);
		deleteOpenNode(open_list,cur_node);
		close_list.push(cur_node);
	} else if (zero_index == 3) {
		childNode(cur_node,end_node,zero_index,0,open_list);
		childNode(cur_node,end_node,zero_index,4,open_list);
		childNode(cur_node,end_node,zero_index,6,open_list);
		deleteOpenNode(open_list,cur_node);
		close_list.push(cur_node);
	} else if (zero_index == 4) {
		childNode(cur_node,end_node,zero_index,1,open_list);
		childNode(cur_node,end_node,zero_index,3,open_list);
		childNode(cur_node,end_node,zero_index,5,open_list);
		childNode(cur_node,end_node,zero_index,7,open_list);
		deleteOpenNode(open_list,cur_node);
		close_list.push(cur_node);
	} else if (zero_index == 5) {
		childNode(cur_node,end_node,zero_index,2,open_list);
		childNode(cur_node,end_node,zero_index,4,open_list);
		childNode(cur_node,end_node,zero_index,8,open_list);
		deleteOpenNode(open_list,cur_node);
		close_list.push(cur_node);
	} else if (zero_index == 6) {
		childNode(cur_node,end_node,zero_index,3,open_list);
		childNode(cur_node,end_node,zero_index,7,open_list);
		deleteOpenNode(open_list,cur_node);
		close_list.push(cur_node);
	} else if (zero_index == 7) {
		childNode(cur_node,end_node,zero_index,4,open_list);
		childNode(cur_node,end_node,zero_index,6,open_list);
		childNode(cur_node,end_node,zero_index,8,open_list);
		deleteOpenNode(open_list,cur_node);
		close_list.push(cur_node);	
	} else if (zero_index == 8) {
		childNode(cur_node,end_node,zero_index,5,open_list);
		childNode(cur_node,end_node,zero_index,7,open_list);
		deleteOpenNode(open_list,cur_node);
		close_list.push(cur_node);
	}
}

/**
 * 找到最佳路径后的回溯函数
 * @param  {object} node   当前节点
 * @param  {array} result  存放最佳路径的数组
 * @return {[type]}        [description]
 */
function ifReachRoot(node,result) {
	result.push(node);
	if (node.g == 0) {
		console.log('回溯到根节点啦!');
		return false;
	} else {
		ifReachRoot(node.parent,result);
	}
}

/**
 * 搜索到达目标节点的过程
 * @param  {object} start_node 初始节点
 * @param  {object} end_node   目标节点
 * @param  {array} 	open_list  open表
 * @param  {array} 	close_list close表
 * @param  {array} 	result     最佳路径
 * @return {[type]}            [description]
 */
function ifReachEnd(start_node,end_node,open_list,close_list,result) {
	cur_node = open_list[0];
	if (cur_node.h == 0) {
		console.log('找到目标节点啦！');
		ifReachRoot(cur_node,result);
	} else if (cur_node.h != 0) {//当前节点不等于目标节点
		expandNode(cur_node,end_node,open_list,close_list);
		//重排open_list
		sortOpenList(open_list);
		
		ifReachEnd(start_node,end_node,open_list,close_list,result);
	}
}

/**
 * 输出最佳路径中的八数码节点
 * @param  {[type]} node [description]
 * @return {[type]}      [description]
 */
function printNode(node) {
	var right_box = $('.right-box');
	var item = $('<div class="node-box clearfix"></div>');
	item.html('<div class="node-box-items">' + node.values[0] + '</div>'+
			'<div class="node-box-items">' + node.values[1] + '</div>'+
			'<div class="node-box-items">' + node.values[2] + '</div>'+
			'<div class="node-box-items">' + node.values[3] + '</div>'+
			'<div class="node-box-items">' + node.values[4] + '</div>'+
			'<div class="node-box-items">' + node.values[5] + '</div>'+
			'<div class="node-box-items">' + node.values[6] + '</div>'+
			'<div class="node-box-items">' + node.values[7] + '</div>'+
			'<div class="node-box-items">' + node.values[8] + '</div>'+
			'<div class="ghf">' + node.g + '+' + node.h + '=' + node.f + '</div>');
	right_box.append(item);
}