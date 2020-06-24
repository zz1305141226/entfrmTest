import request from '@/utils/request'

// 查询消息内容列表
export function listInfoContent(query) {
  return request({
    url: '/msg/infoContent/list',
    method: 'get',
    params: query
  })
}

// 查询消息内容详细
export function getInfoContent(id) {
  return request({
    url: '/msg/infoContent/' + id,
    method: 'get'
  })
}

// 新增消息内容
export function addInfoContent(data) {
  return request({
    url: '/msg/infoContent/save',
    method: 'post',
    data: data
  })
}

// 修改消息内容
export function editInfoContent(data) {
  return request({
    url: '/msg/infoContent/update',
    method: 'put',
    data: data
  })
}

// 删除消息内容
export function delInfoContent(id) {
  return request({
    url: '/msg/infoContent/remove/' + id,
    method: 'delete'
  })
}



// 导出消息内容
export function exportInfoContent(query) {
  return request({
    url: '/msg/infoContent/export',
    method: 'get',
    params: query
  })
}
