import request from '@/utils/request'
import { praseStrEmpty } from "@/utils/entfrm";

// 查询数据表列表
export function listDatatable(query) {
  return request({
    url: '/devtool/datatable/list',
    method: 'get',
    params: query
  })
}

// 查看数据表详细
export function getDatatable(datatableId) {
  return request({
    url: '/devtool/datatable/' + praseStrEmpty(datatableId),
    method: 'get'
  })
}

// 查询表详细信息
export function getGenTable(tableName, tableComment) {
  const data = {
    tableName,
    tableComment
  }
  return request({
    url: '/devtool/datatable/getGenTable',
    method: 'post',
    data: data
  })
}

// 修改代码生成信息
export function updateGenTable(data) {
  return request({
    url: '/devtool/datatable/update',
    method: 'put',
    data: data
  })
}

// 预览生成代码
export function previewTable(tableId) {
  return request({
    url: '/devtool/datatable/preview/' + tableId,
    method: 'get'
  })
}

// 删除数据表
export function delDatatable(alias, tableName) {
  const data = {
    alias,
    tableName
  }
  return request({
    url: '/devtool/datatable/remove',
    method: 'get',
    data: data
  })
}

// 生成文件到本地
export function batchGenToLocal(tables) {
  return request({
    url: '/devtool/datatable/batchGenToLocal/' + tables,
    method: 'get'
  })
}
